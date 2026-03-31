export interface ICreateBusiness {
  admin: IBAdmin;
  business: IBBusiness;
  contact: IBContact;
}

interface IBAdmin {
  email: string;
  firstName: string;
  ic: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  roleId: string;
  userName: string;
}

interface IBBusiness {
  city: string;
  companyName: string;
  country: string;
  description: string;
  province: string;
  slug: string;
  street: string;
  taxId: string;
  tradeName: string;
  zipCode: string;
}

interface IBContact {
  email: string;
  phoneNumber: string;
  website?: string;
  whatsAppNumber: string;
}
