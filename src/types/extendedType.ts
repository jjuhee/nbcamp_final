import { getProjects } from "@/app/(providers)/(default)/projects/api"
import { Tables } from "./supabase"

export type ExtendedProjectsType = Tables<"projects"> & {
  project_tech: ExtendedProjectTechType[]
}

export type ExtendedProjectTechType = Tables<"project_tech"> & {
  techs: Tables<"techs">
}

export type ExtendedUsersType = Tables<"users"> & {
  position: Tables<"positions">
  user_tech: ExtendedUserTechType[]
}

export type ExtendedUserTechType = Tables<"user_tech"> & {
  techs: Tables<"techs">
}

export type TProjectsType = Exclude<
  Awaited<ReturnType<typeof getProjects>>,
  undefined
>[number]
