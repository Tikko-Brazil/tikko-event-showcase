import { memo } from "react";
import { CardPayment } from "@mercadopago/sdk-react";
import {
  IAdditionalData,
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/esm/bricks/cardPayment/type";

interface MemoizedCardPaymentProps {
  amount: number;
}

export const MemoizedCardPayment = memo<MemoizedCardPaymentProps>(
  ({ amount }) => {
    return (
      <CardPayment
        initialization={{ amount }}
        customization={{
          visual: {
            style: {
              theme: "dark",
              customVariables: {
                formBackgroundColor: "hsl(224, 71%, 4%)",
                errorColor: "hsl(0, 62.8%, 30.6%)",
                baseColor: "hsl(263, 70%, 50%)",
                baseColorFirstVariant: "hsl(215, 28%, 17%)",
                baseColorSecondVariant: "hsl(217, 33%, 17%)",
                inputBackgroundColor: "hsl(215, 28%, 17%)",
                successColor: "hsl(263, 70%, 50%)",
                textPrimaryColor: "hsl(210, 40%, 98%)",
                textSecondaryColor: "hsl(217.9, 10.6%, 64.9%)",
                inputFocusedBorderColor: "hsl(263, 70%, 50%)",
                placeholderColor: "hsl(217.9, 10.6%, 64.9%)",
              },
            },
            hideFormTitle: true,
            hidePaymentButton: true,
          },
          paymentMethods: {
            maxInstallments: 1,
          },
        }}
        onSubmit={async (
          param: ICardPaymentFormData<ICardPaymentBrickPayer>,
          param2?: IAdditionalData
        ) => {}}
      />
    );
  }
);

MemoizedCardPayment.displayName = "MemoizedCardPayment";
