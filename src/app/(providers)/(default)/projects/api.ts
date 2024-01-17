import { supabaseForClient } from "@/supabase/supabase.client"
import { Database, Tables } from "@/types/supabase"
import { equal } from "assert"

/** 전체 프로젝트 리스트 가져오기 */
export async function getProjects({
  orderBy = "created_at",
  order = 1,
  limit = 0,
  offset = 0,
  recruitStatus = false,
  isOffline = null,
  startDate = "",
  endDate = "",
  numberOfPeople,
  regionId,
  techs,
}: TProjectsOptions) {
  const query = supabaseForClient.from("projects").select("*")

  /** 페이지 네이션 */
  limit !== 0 && query.range(offset, limit)

  /** 모집중인 프로젝트 */
  recruitStatus && query.eq("recruit_status", false)

  /** 프로젝트 방식(온오프라인) */
  if (isOffline !== null) {
    query.eq("is_offline", isOffline)
  }

  /** 프로젝트 진행 날짜 */
  if (startDate !== "" && endDate === "") {
    query.gte("project_start_date", startDate)
  } else if (startDate === "" && endDate !== "") {
    query.lte("project_end_date", endDate)
  } else if (startDate !== "" && endDate !== "") {
    query
      .gte("project_start_date", startDate)
      .lte("project_start_date", endDate)
  }

  /** 활동 지역 */
  regionId && regionId !== "0" && query.eq("region_id", regionId)

  // TODO: 스택 필터링
  if ((techs?.length as number) > 0) {
    console.log("techs", techs)
    const techIds = techs?.map((tech) => tech.id)
    const { data: projectIds, error: projectError } = await supabaseForClient
      .from("project_tech")
      .select("project_id")
      .in("tech_id", techIds || [])

    console.log("projectIds", projectIds)

    if (projectError) {
      console.error("Error fetching projectIds:", projectError.message)
      return []
    }

    if (projectIds.length >= 0) {
      const filteredProjectIds = projectIds.map(
        (projectId) => projectId.project_id,
      )

      // 프로젝트 아이디 배열로 필터링
      query.in("id", filteredProjectIds)
    }
  }

  /** 프로젝트별 북마크 수 가져오기 */
  const bookmarksCountByProject = await getBookmarksCountByProject()

  const { data, error } = await query

  /** 북마크 수를 프로젝트에 추가 
      북마크 수 정보가 있다면 업데이트, 없다면 기존 값 유지 */
  const projectsWithBookmarkCount = data?.map((project) => {
    const bookmarkCountInfo = bookmarksCountByProject.find(
      (item) => item.projectId === project.id,
    )
    return {
      ...project,
      bookmark_count: bookmarkCountInfo
        ? bookmarkCountInfo.count
        : project.bookmark_count,
    }
  })

  /** 정렬 */
  order === 1
    ? (projectsWithBookmarkCount || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      )
    : order === 2
      ? (projectsWithBookmarkCount || []).sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        )
      : (projectsWithBookmarkCount || []).sort(
          (a, b) => b.bookmark_count - a.bookmark_count,
        ) // 유효한 날짜 형식인지 확인하고 반환하는 함수
  function getValidDate(dateString: string): Date {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? new Date(0) : date
  }

  return projectsWithBookmarkCount
}

/** projectId 값과 일치하는 프로젝트 가져오기 */
export async function getProject(projectId: string) {
  const { data: projectData, error: projectError } = await supabaseForClient
    .from("projects")
    .select(
      "*, user:users(id, user_nickname, avatar_url), region:project_regions(*)",
    )
    .eq("id", projectId)
    .single()

  if (projectError) console.log("error", projectError)

  return projectData || null
}

/** 현재 유저 데이터 가져오기 */
export async function getUser() {
  const { data: userData } = await supabaseForClient.auth.getUser()

  return userData
}

export async function removeProject(projectId: string) {
  const { error: projectError } = await supabaseForClient
    .from("projects")
    .delete()
    .match({ id: projectId })

  if (projectError) console.log("error", projectError)
}

/** 모든 북마크 데이터 가져오기 */
export async function getBookmarks() {
  const { data, error } = await supabaseForClient.from("bookmarks").select("*")

  if (error) console.log("error", error)

  return data as Tables<"bookmarks">[]
}

/** userId와 일치하는 북마크 데이터 가져오기 */
export async function getBookmarksByUserId(userId: string) {
  const { data, error } = await supabaseForClient
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)

  if (error) console.log("error", error)

  return data as Tables<"bookmarks">[]
}

/** 북마크 추가하기 */
export async function setBookmarks({
  projectId,
  currentUser,
}: {
  projectId: string
  currentUser: string
}) {
  const { data, error } = await supabaseForClient
    .from("bookmarks")
    .insert([{ user_id: currentUser, project_id: projectId }])
    .select("*")

  if (error) console.log("error", error)

  return data
}

/** 북마크 삭제하기 */
export async function removeBookmarks({
  projectId,
  currentUser,
}: {
  projectId: string
  currentUser?: string
}) {
  const { error } = await supabaseForClient
    .from("bookmarks")
    .delete()
    .eq("project_id", projectId)

  if (error) console.log("error", error)
}

/** 프로젝트 북마크 수  가져오기 */
export async function getBookmarksCountByProject() {
  const { data: bookmarks, error } = await supabaseForClient
    .from("bookmarks")
    .select("*")

  if (error) {
    console.error("Error fetching bookmarks:", error)
    return []
  }

  // 그룹화된 결과를 담을 객체
  const bookmarksCountByProject = {}

  // 각 북마크를 반복하면서 projectId를 기준으로 그룹화
  bookmarks.forEach((bookmark) => {
    const projectId = bookmark.project_id

    if (bookmarksCountByProject[projectId] === undefined) {
      // 새로운 프로젝트인 경우 초기화
      bookmarksCountByProject[projectId] = 1
    } else {
      // 기존에 등장한 프로젝트인 경우 카운트 증가
      bookmarksCountByProject[projectId]++
    }
  })

  // 결과를 배열로 변환하여 반환
  const result = Object.entries(bookmarksCountByProject).map(
    ([projectId, count]) => ({
      projectId,
      count,
    }),
  )

  return result
}

/** projectId와 일치하는 기술 스택 가져오기 */
export async function getProjectTech(projectId: string) {
  const { data, error } = await supabaseForClient
    .from("project_tech")
    .select("*, techs:techs(*)")
    .eq("project_id", projectId)

  const techs = data?.map((tech) => tech.techs?.tech_name)

  if (error) console.log("error", error)

  return techs
}

/** 포지션에 대한 기술 스택 가져오기 */
export async function getTechs() {
  try {
    // 1. 모든 포지션을 가져온다
    const { data: positions, error: positionError } = await supabaseForClient
      .from("positions")
      .select("*")

    if (positionError) {
      console.error("Error fetching positions:", positionError)
      throw positionError
    }

    // 2. 각 포지션에 대한 techs를 가져온다
    const techsPromises = positions.map(async (position) => {
      const { data: positionTechs, error: positionTechError } =
        await supabaseForClient
          .from("position_tech")
          .select("*, techs: techs(*)")
          .eq("position_id", position.id)

      if (positionTechError) {
        console.error(
          `Error fetching techs for position ${position.id}:`,
          positionTechError,
        )
        throw positionTechError
      }

      // 3. 가져온 techs 데이터를 반환한다
      return positionTechs?.map((tech) => tech.techs)
    })

    // 모든 포지션에 대한 techs를 병렬로 가져오기
    const techs = await Promise.all(techsPromises)

    return techs
  } catch (error) {
    console.error("Error in getTechs:", error)
    throw error
  }
}

/** 지역 가져오기 */
export async function getRegions() {
  const { data, error } = await supabaseForClient
    .from("project_regions")
    .select("*")

  if (error) console.log("error", error)

  return data
}
