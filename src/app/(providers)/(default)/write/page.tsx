"use client"
import Tiptap from "@/app/(providers)/(default)/write/_components/Tiptap"
import Spacer from "@/components/ui/Spacer"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import React, { FormEvent, useEffect, useState } from "react"
import { setProject } from "./api"
import Category from "./_components/Category"
import { useRouter } from "next/navigation"
import { Tables, TablesInsert } from "@/types/supabase"
import useUserStore from "@/store/user"
import formatDate from "@/utils/formatDate"
import dayjs from "dayjs"

interface TProjectWithRegion extends Tables<"projects"> {
  region: Tables<"project_regions"> | null
}

interface Props {
  projectId: string
  project: TProjectWithRegion
  techsWithPositions: TTechs[]
}
const WritePage = ({ projectId, project, techsWithPositions }: Props) => {
  const isEditMode = !!projectId
  const initialCategoryData: TCategoryData = {
    startDate: "",
    endDate: "",
    isOffline: null,
    region: null,
    numberOfMembers: 0,
    positions: [],
    techs: [],
  }
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [categoryData, setCategoryData] =
    useState<TCategoryData>(initialCategoryData)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: setProject,
    onSuccess: (insertedData) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      alert(isEditMode ? "수정 완료~!" : "게시물 작성 완료~!")
      resetState()
      router.push(`/projects/${insertedData[0].id}`)
    },
    onError: () => {
      alert(
        "DB에 알수 없는 에러로 게시물이 정상적으로 추가되지 않았을 수 있습니다(-.-)(_ _)",
      )
    },
  })
  /** 현재 인증된 유저 데이터 가져오기 */
  const { userId } = useUserStore()

  /** 수정시 : 내용 가져오기 */
  useEffect(() => {
    if (!isEditMode) return
    if (!project) return

    console.log("useEffect", project)
    setTitle(project.title)
    setContent(project.content)
    setCategoryData((prev) => ({
      ...prev,
      startDate: dayjs(project.project_start_date).format("YYYY-MM-DD"),
      endDate: dayjs(project.project_end_date).format("YYYY-MM-DD"),
      isOffline: project.is_offline,
      numberOfMembers: project.number_of_people,
      region: project.is_offline ? project.region?.id! : null,
      techs: techsWithPositions as TTechs[],
    }))
  }, [project])

  /** 제출하기 */
  const submitProjectHandler = (e: FormEvent) => {
    e.preventDefault()
    if (
      !title ||
      !content ||
      !categoryData.startDate ||
      !categoryData.endDate ||
      categoryData.numberOfMembers <= 0
    ) {
      alert("data를 모두 입력 해주세요~") // TODO P3:(jhee) 없는 것을 표시해 주면 좋겠다.
      return
    }
    if (categoryData.isOffline && !categoryData.region) {
      alert("오프라인 프로젝트이면 지역을 입력하세요~")
      return
    }
    if (categoryData.techs.length <= 0) {
      alert("원하는 포지션과 테크를 입력 하세요")
      return
    }

    /* 쓰기/수정 둘다 사용 주의 */
    const newData: TablesInsert<"projects"> = {
      id: projectId,
      user_id: userId,
      title,
      content,
      project_start_date: categoryData.startDate,
      project_end_date: categoryData.endDate,
      is_offline: categoryData.isOffline!,
      number_of_people: categoryData.numberOfMembers,
      region_id: categoryData.region,
      updated_at: isEditMode ? dayjs(new Date()).toString() : null,
    }

    mutate({
      isEditMode,
      project: newData,
      techs: categoryData.techs,
    })
  }

  const resetState = () => {
    setTitle("")
    setContent("")
    setCategoryData(initialCategoryData)
  }

  return (
    <form onSubmit={submitProjectHandler}>
      <div className="flex flex-col mt-10 mb-10">
        <div className="flex">
          <input
            placeholder="제목을 작성하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="grow border-black border-solid border-2 rounded-md " //TODO : 얇게 어떻게
          />
          <button
            type="submit"
            className="w-40 rounded-full border-solid border-2 bg-black text-white"
          >
            작성하기
          </button>
        </div>
      </div>
      {/*  카테고리 선택 box  */}
      <Category
        categoryData={categoryData}
        setCategoryData={setCategoryData}
        isWritePage={true}
      />
      <Spacer y={30} />
      {/* Tiptap editor box */}
      <div className="border-solid border-b border-black">
        <Spacer y={20} />

        {isEditMode ? (
          content && (
            <div>
              <Tiptap content={content} setContent={setContent} />
            </div>
          )
        ) : (
          <Tiptap content={content} setContent={setContent} />
        )}
      </div>
      {/* TODO P1: (jhee) 첨부파일 넣는 곳? */}
    </form>
  )
}

export default WritePage
