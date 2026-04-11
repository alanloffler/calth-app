import { COUNTRIES } from "@core/constants/countries.constant";

export function getCountry(countryCode: string): string {
  return COUNTRIES.find((country) => country.code === countryCode)?.label ?? countryCode;
}
