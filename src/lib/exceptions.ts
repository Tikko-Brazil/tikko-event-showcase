export class BadRequestException extends Error {
  constructor(message: string = 'Bad Request') {
    super(message);
    this.name = 'BadRequestException';
  }
}

export class UnauthorizedException extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenException';
  }
}

export class NotFoundException extends Error {
  constructor(message: string = 'Not Found') {
    super(message);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends Error {
  constructor(message: string = 'Conflict') {
    super(message);
    this.name = 'ConflictException';
  }
}

export class GoneException extends Error {
  constructor(message: string = 'Gone') {
    super(message);
    this.name = 'GoneException';
  }
}

export class UnprocessableEntityException extends Error {
  constructor(message: string = 'Unprocessable Entity') {
    super(message);
    this.name = 'UnprocessableEntityException';
  }
}

export class TooManyRequestsException extends Error {
  constructor(message: string = 'Too Many Requests') {
    super(message);
    this.name = 'TooManyRequestsException';
  }
}

export class InternalServerErrorException extends Error {
  constructor(message: string = 'Internal Server Error') {
    super(message);
    this.name = 'InternalServerErrorException';
  }
}
