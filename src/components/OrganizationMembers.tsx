import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Crown, Users as UsersIcon, Pencil, Trash2, UserPlus } from "lucide-react";
import { SearchAndFilter } from "./SearchAndFilter";
import { Pagination } from "./Pagination";
import { useGetOrganizationMembers, useUpdateMemberRole, useRemoveOrganizationMember, useAddOrganizationMember, OrganizationMember } from "@/api/members/api";
import { updateMemberRoleErrorMessage, removeOrganizationMemberErrorMessage, addOrganizationMemberErrorMessage } from "@/api/members/errors";
import { normalizeApiError } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { createCommonValidations } from "@/lib/validationSchemas";

interface OrganizationMembersProps {
  organizationId: number;
}

const getRoleIcon = (role: number) => {
  switch (role) {
    case 3: // Owner
      return <Crown className="h-4 w-4" />;
    case 2: // Manager
      return <Shield className="h-4 w-4" />;
    default:
      return null;
  }
};

const getRoleLabel = (role: number, t: any) => {
  const roleKeys = {
    0: "member",
    1: "coordinator",
    2: "manager",
    3: "owner",
  };
  const roleKey = roleKeys[role as keyof typeof roleKeys];
  return roleKey ? t(`organizationManagement.members.roles.${roleKey}`) : role.toString();
};

const getRoleBadgeVariant = (role: number) => {
  switch (role) {
    case 3: // Owner
      return "default";
    case 2: // Manager
      return "secondary";
    default:
      return "outline";
  }
};

export const OrganizationMembers = ({ organizationId }: OrganizationMembersProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [memberPage, setMemberPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const membersPerPage = 6;

  // Add member mutation
  const addMemberMutation = useAddOrganizationMember(organizationId);

  // Add member form validation
  const commonValidations = createCommonValidations(t);
  const addMemberSchema = Yup.object().shape({
    email: commonValidations.email,
    role: Yup.number()
      .required("Role is required")
      .oneOf([0, 1, 2, 3], "Invalid role selected"),
  });

  const addMemberFormik = useFormik({
    initialValues: {
      email: "",
      role: 0,
    },
    validationSchema: addMemberSchema,
    onSubmit: (values) => {
      addMemberMutation.mutate(values, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          addMemberFormik.resetForm();
          queryClient.invalidateQueries({
            queryKey: ["organization-members", organizationId],
          });
          toast({
            title: t("common.success"),
            description: t("organizationManagement.members.messages.addSuccess"),
          });
        },
        onError: (error) => {
          const appError = normalizeApiError(error);
          toast({
            variant: "destructive",
            title: t("common.error"),
            description: addOrganizationMemberErrorMessage(appError, t),
          });
        },
      });
    },
  });

  // Update member role mutation
  const updateMemberMutation = useUpdateMemberRole(
    organizationId,
    editingMember?.id || 0
  );

  // Remove member mutation
  const removeMemberMutation = useRemoveOrganizationMember(
    organizationId,
    0 // Will be set when calling mutate
  );

  const handleRemoveMember = (memberId: number) => {
    const mutation = useRemoveOrganizationMember(organizationId, memberId);
    mutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["organization-members", organizationId],
        });
        toast({
          title: t("common.success"),
          description: t("organizationManagement.members.messages.removeSuccess"),
        });
      },
      onError: (error) => {
        const appError = normalizeApiError(error);
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: removeOrganizationMemberErrorMessage(appError, t),
        });
      },
    });
  };

  // Update member form validation
  const updateMemberSchema = Yup.object().shape({
    role: Yup.number()
      .required("Role is required")
      .oneOf([0, 1, 2, 3], "Invalid role selected"),
  });

  const updateMemberFormik = useFormik({
    initialValues: {
      role: 0,
    },
    validationSchema: updateMemberSchema,
    onSubmit: (values) => {
      updateMemberMutation.mutate(
        { role: values.role },
        {
          onSuccess: () => {
            setEditingMember(null);
            updateMemberFormik.resetForm();
            queryClient.invalidateQueries({
              queryKey: ["organization-members", organizationId],
            });
            toast({
              title: t("common.success"),
              description: t("organizationManagement.members.messages.updateSuccess"),
            });
          },
          onError: (error) => {
            const appError = normalizeApiError(error);
            toast({
              variant: "destructive",
              title: t("common.error"),
              description: updateMemberRoleErrorMessage(appError, t),
            });
          },
        }
      );
    },
  });

  // Debounced search function
  const debouncedSetSearch = useCallback(
    debounce((searchTerm: string) => {
      setDebouncedSearch(searchTerm);
    }, 500),
    []
  );

  // Update debounced search when memberSearch changes
  React.useEffect(() => {
    debouncedSetSearch(memberSearch);
  }, [memberSearch, debouncedSetSearch]);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setMemberPage(1);
  }, [memberFilter, debouncedSearch]);

  const { data: membersData, isLoading } = useGetOrganizationMembers(organizationId, {
    role: memberFilter,
    search: debouncedSearch,
    page: memberPage,
    limit: membersPerPage,
  });

  const filterOptions = [
    { value: "all", label: t("organizationManagement.members.filters.all") },
    { value: "0", label: t("organizationManagement.members.filters.member") },
    { value: "1", label: t("organizationManagement.members.filters.coordinator") },
    { value: "2", label: t("organizationManagement.members.filters.manager") },
    { value: "3", label: t("organizationManagement.members.filters.owner") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("organizationManagement.members.title")}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("organizationManagement.members.addButton")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("organizationManagement.members.addDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("organizationManagement.members.addDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addMemberFormik.handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-email">{t("organizationManagement.members.addDialog.fields.email")}</Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder={t("organizationManagement.members.addDialog.fields.emailPlaceholder")}
                  value={addMemberFormik.values.email}
                  onChange={addMemberFormik.handleChange}
                  onBlur={addMemberFormik.handleBlur}
                  name="email"
                />
                {addMemberFormik.touched.email && addMemberFormik.errors.email && (
                  <p className="text-sm text-red-500">{addMemberFormik.errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role">{t("organizationManagement.members.addDialog.fields.role")}</Label>
                <Select
                  value={addMemberFormik.values.role.toString()}
                  onValueChange={(value) => addMemberFormik.setFieldValue("role", parseInt(value))}
                >
                  <SelectTrigger id="add-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t("organizationManagement.members.roles.member")}</SelectItem>
                    <SelectItem value="1">{t("organizationManagement.members.roles.coordinator")}</SelectItem>
                    <SelectItem value="2">{t("organizationManagement.members.roles.manager")}</SelectItem>
                    <SelectItem value="3">{t("organizationManagement.members.roles.owner")}</SelectItem>
                  </SelectContent>
                </Select>
                {addMemberFormik.touched.role && addMemberFormik.errors.role && (
                  <p className="text-sm text-red-500">{addMemberFormik.errors.role}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    addMemberFormik.resetForm();
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={addMemberMutation.isPending}>
                  {addMemberMutation.isPending
                    ? t("organizationManagement.members.addDialog.buttons.adding")
                    : t("organizationManagement.members.addDialog.buttons.add")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SearchAndFilter
        searchValue={memberSearch}
        onSearchChange={setMemberSearch}
        searchPlaceholder={t("organizationManagement.members.searchPlaceholder")}
        filterValue={memberFilter}
        onFilterChange={setMemberFilter}
        filterOptions={filterOptions}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      ) : !membersData?.members?.length ? (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("organizationManagement.members.noMembers")}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {membersData.members.map((member) => (
              <Card key={member.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {member.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm leading-none">
                          {member.username}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getRoleBadgeVariant(member.organization_role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.organization_role)}
                        <span>{getRoleLabel(member.organization_role, t)}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    {member.instagram_profile && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Instagram:</span>
                        <span className="font-medium">
                          {member.instagram_profile}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Dialog
                      open={editingMember?.id === member.id}
                      onOpenChange={(open) => {
                        if (open && member.organization_role !== 3) {
                          setEditingMember(member);
                          updateMemberFormik.setValues({
                            role: member.organization_role,
                          });
                        } else {
                          setEditingMember(null);
                          updateMemberFormik.resetForm();
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          disabled={member.organization_role === 3}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          {t("common.edit")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("organizationManagement.members.editDialog.title")}</DialogTitle>
                          <DialogDescription>
                            {t("organizationManagement.members.editDialog.description")}
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={updateMemberFormik.handleSubmit}
                          className="space-y-4 py-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="edit-role">{t("organizationManagement.members.editDialog.fields.role")}</Label>
                            <Select
                              value={updateMemberFormik.values.role.toString()}
                              onValueChange={(value) =>
                                updateMemberFormik.setFieldValue("role", parseInt(value))
                              }
                            >
                              <SelectTrigger id="edit-role">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">{t("organizationManagement.members.roles.member")}</SelectItem>
                                <SelectItem value="1">{t("organizationManagement.members.roles.coordinator")}</SelectItem>
                                <SelectItem value="2">{t("organizationManagement.members.roles.manager")}</SelectItem>
                                <SelectItem value="3">{t("organizationManagement.members.roles.owner")}</SelectItem>
                              </SelectContent>
                            </Select>
                            {updateMemberFormik.touched.role &&
                              updateMemberFormik.errors.role && (
                                <p className="text-sm text-red-500">
                                  {updateMemberFormik.errors.role}
                                </p>
                              )}
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingMember(null)}
                            >
                              {t("common.cancel")}
                            </Button>
                            <Button
                              type="submit"
                              disabled={updateMemberMutation.isPending}
                            >
                              {updateMemberMutation.isPending
                                ? t("organizationManagement.members.editDialog.buttons.saving")
                                : t("organizationManagement.members.editDialog.buttons.save")}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1"
                          disabled={member.organization_role === 3}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("common.remove")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("organizationManagement.members.removeDialog.title")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("organizationManagement.members.removeDialog.description")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            {t("organizationManagement.members.removeDialog.buttons.remove")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {membersData.total_pages > 1 && (
            <Pagination
              currentPage={memberPage}
              totalPages={membersData.total_pages}
              onPageChange={setMemberPage}
              startIndex={(memberPage - 1) * membersPerPage + 1}
              endIndex={Math.min(memberPage * membersPerPage, membersData.total)}
              totalItems={membersData.total}
            />
          )}
        </>
      )}
    </div>
  );
};
