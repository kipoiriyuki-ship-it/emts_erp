import { User } from "@/lib/types";

export interface AuthPayload {
  access_token?: string
  token?: string
  refresh_token?: string
  license_status?: 'waiting' | 'active' | string
  expires_in?: number
  token_type?: string
  user: User
  [key: string]: any
}

export const normalizeAuthPayload = (payload: any): AuthPayload => {
  const baseData = payload?.data ?? payload
  const normalized = baseData?.data ?? baseData
  const accessToken = normalized?.access_token ?? normalized?.token
  const refreshToken = normalized?.refresh_token ?? normalized?.refreshToken ?? normalized?.refreshTokenValue
  const licenseStatus = normalized?.license_status ?? normalized?.licenseStatus

  return {
    ...normalized,
    access_token: accessToken,
    token: accessToken,
    refresh_token: refreshToken,
    license_status: licenseStatus,
    token_type: normalized?.token_type ?? normalized?.tokenType,
    expires_in: normalized?.expires_in ?? normalized?.expiresIn,
    user: (normalized?.user as User) ?? ({} as User),
  }
}
