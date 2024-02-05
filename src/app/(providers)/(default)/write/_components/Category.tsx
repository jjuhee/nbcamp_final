"use client"

import React, { Dispatch, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getRegions, getTechsByPositions } from "../../projects/api"
import SelectStackButton from "./SelectStackButton"
import Button from "@/components/ui/Button"
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io"
import { useCustomModal } from "@/hooks/useCustomModal"
import useOnClickOutSide from "@/hooks/useOnClickOutSide"
import useProjectsStore from "@/store/projects"

import type { Tables } from "@/types/supabase"

interface Props {
  categoryData: TCategoryData
  setCategoryData: React.Dispatch<React.SetStateAction<TCategoryData>>
  isWritePage: boolean
  setOption?: Dispatch<React.SetStateAction<TProjectsOptions>>
  isShownCategory?: boolean
  setIsShownCategory: React.Dispatch<React.SetStateAction<boolean>>
}

const Category = ({
  categoryData,
  setCategoryData,
  isWritePage,
  setOption,
  isShownCategory,
  setIsShownCategory,
}: Props) => {
  const { openCustomModalHandler } = useCustomModal()
  const dropdownRef = useRef<HTMLInputElement>(null)
  const { setPage } = useProjectsStore((state) => state)
  const { startDate, endDate, isOffline, region, numberOfMembers, techs } =
    categoryData

  const [isRegionActive, setIsRegionActive] = useState(false)

  /** 모든 position에 연결된 tech를 position_tech table에서 불러온다 */
  const { data: allTechs } = useQuery({
    queryKey: ["techsByPositions"],
    queryFn: getTechsByPositions,
  })

  /** project_region table */
  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  })

  /** 프로젝트 필터링 검색 핸들러 */
  const onClickSearchHandler = () => {
    setOption &&
      setOption({
        isOffline: isOffline,
        startDate: startDate,
        endDate: endDate,
        regionId: region,
        techs: techs,
      })
    openCustomModalHandler("검색되었습니다.", "alert")
    setPage(1)
    setIsShownCategory(false)
  }

  /** 검색 초기화 */
  const onClickResetFilteringHandler = () => {
    setCategoryData({
      startDate: "",
      endDate: "",
      isOffline: null,
      region: "",
      numberOfMembers: 0,
      positions: [],
      techs: [],
    })
    setOption &&
      setOption({
        isOffline: null,
        startDate: "",
        endDate: "",
        regionId: "",
        techs: [],
      })
    setPage(1)
  }

  useOnClickOutSide({
    ref: dropdownRef,
    handler: () => setIsRegionActive(false),
  })

  return (
    <section
      className={`flex-col gap-4 bg-white ${
        isShownCategory || isWritePage
          ? `block ${
              isShownCategory &&
              "fixed top-0 left-0 w-full h-full z-10 overflow-scroll"
            }`
          : "hidden"
      } md:block`}
    >
      {!isWritePage && (
        <div className="flex justify-between items-center">
          <h1>필터링 검색</h1>
          <span
            className="block mr-5 cursor-pointer md:hidden"
            onClick={() => setIsShownCategory((prev) => !prev)}
          >
            X
          </span>
        </div>
      )}
      <div className="flex flex-col md:flex-row relative justify-between gap-[39px] border-t md:border-y py-5 px-1 border-slate-800">
        <div>
          <div className="flex flex-col gap-[16px] py-[15px]">
            <h3>프로젝트 방식</h3>
            <ul className="flex gap-[8px] items-center *:w-[90px] *:text-center ">
              <li
                onClick={() =>
                  setCategoryData({ ...categoryData, isOffline: true })
                }
                className={`category justify-center ${
                  !!isOffline
                    ? "bg-[#D2D2D2] border-[#D2D2D2] text-black font-semibold"
                    : "border-[#A6A6A6] text-[#2D2D2D] font-medium"
                }`}
              >
                오프라인
              </li>
              <li
                onClick={() =>
                  setCategoryData({ ...categoryData, isOffline: false })
                }
                className={`category justify-center ${
                  isOffline === false
                    ? "bg-[#D2D2D2] border-[#D2D2D2] text-black font-semibold"
                    : "border-[#A6A6A6] text-[#2D2D2D] font-medium"
                }`}
              >
                온라인
              </li>
            </ul>
          </div>
          {isOffline && (
            <div className="flex flex-col gap-[16px] py-[15px]">
              <h3>활동 지역</h3>
              <div ref={dropdownRef} className="relative">
                <div
                  className={`category flex items-center justify-between px-[20px] py-[5px] rounded-lg w-[200px] h-[40px] ${
                    isRegionActive
                      ? "border-main-lime bg-main-lime hover:bg-main-lime hover:border-main-lime font-semibold"
                      : "bg-[#D2D2D2] border-[#D2D2D2] text-black font-semibold"
                  }`}
                  onClick={() => setIsRegionActive(!isRegionActive)}
                >
                  {regions?.find((region) => region.id == categoryData.region)
                    ?.region || "지역을 입력하세요"}
                  {isRegionActive ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div>
                <ul
                  className={`absolute flex flex-col mt-[3px] rounded-lg border-[1px] border-black  ${
                    isRegionActive ? "visible" : "invisible"
                  }`}
                >
                  {regions?.map((region) => (
                    <li
                      key={region.id}
                      className="cursor-pointer px-[18px] bg-white text-[14px] leading-[38px] w-[180px] h-[38px] first:rounded-t-lg last:rounded-b-lg z-10 hover:bg-[#DBFFB2]"
                      onClick={(e) => {
                        setCategoryData({
                          ...categoryData,
                          region: region.id,
                        })
                        setIsRegionActive(false)
                      }}
                    >
                      {region.region}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {isWritePage && (
          <div className="flex flex-col gap-[16px] py-[15px] w-[99px]">
            <h3>구인 인원</h3>
            <div className="flex gap-[8px] items-center">
              <input
                className={`category w-[70px] text-center
                ${
                  numberOfMembers
                    ? "border-black text-black font-semibold"
                    : "border-[#A6A6A6] text-[#2D2D2D] font-medium"
                }`}
                type="number"
                value={numberOfMembers}
                min={0}
                max={100}
                onChange={(e) => {
                  e.target.value =
                    Number(e.target.value) > 100 ? "100" : e.target.value
                  setCategoryData({
                    ...categoryData,
                    numberOfMembers: Number(e.target.value),
                  })
                }}
              />
              <span>명</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-[16px] py-[15px]">
          <ul className="flex flex-col gap-4">
            <h3>프로젝트 기간</h3>
            <li className="flex items-center gap-4">
              <label className="w-[50px] text-[16px]">시작일</label>
              <input
                className={`category w-[170px] px-[20px] py-[5px] cursor-pointer
                ${
                  startDate
                    ? "border-black text-black font-semibold"
                    : "border-[#A6A6A6] text-[#2D2D2D] font-medium"
                }
                `}
                type="date"
                name="project_start_date"
                value={startDate}
                min={
                  isWritePage
                    ? new Date().toISOString().split("T")[0]
                    : new Date(new Date().getFullYear() - 100, 0, 1)
                        .toISOString()
                        .split("T")[0]
                }
                max={endDate && endDate}
                onChange={(e) =>
                  setCategoryData({
                    ...categoryData,
                    startDate: e.target.value,
                  })
                }
              />
            </li>
            <li className="flex items-center gap-4">
              <label className="w-[50px] text-[16px]">종료일</label>
              <input
                className={`category w-[170px] px-[20px] py-[5px] cursor-pointer
                ${
                  endDate
                    ? "border-black text-black font-semibold"
                    : "border-[#A6A6A6] text-[#2D2D2D] font-medium"
                } disabled:text-[#A6A6A6] disabled:cursor-not-allowed 
                `}
                type="date"
                name="project_end_date"
                disabled={isWritePage && !startDate}
                min={
                  isWritePage
                    ? startDate
                    : startDate
                      ? startDate
                      : new Date(new Date().getFullYear() - 100, 0, 1)
                          .toISOString()
                          .split("T")[0]
                }
                max={
                  new Date(new Date().getFullYear() + 100, 11, 31)
                    .toISOString()
                    .split("T")[0]
                }
                value={endDate}
                onChange={(e) =>
                  setCategoryData({
                    ...categoryData,
                    endDate: e.target.value,
                  })
                }
              />
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-[16px] py-[15px] items-start">
          <h3>기술 스택</h3>
          <ul className="flex flex-col md:flex-row gap-3 ">
            <SelectStackButton
              allTechs={allTechs as Tables<"techs">[][]}
              categoryData={categoryData}
              setCategoryData={setCategoryData}
            />
          </ul>
        </div>
        {/* 메인page */}
        {!isWritePage && (
          <div
            className="flex fixed bottom-0 w-full justify-around bg-white p-10 border  md:justify-normal  md:absolute md:bottom-6 md:right-[1px] md:gap-3 md:p-0 md:w-auto *:w-[100px] md:*:h-[40px] md:border-none
          "
          >
            <Button
              type="border"
              text="초기화"
              handler={onClickResetFilteringHandler}
            />

            <Button text="검색" handler={onClickSearchHandler} />
          </div>
        )}
      </div>
    </section>
  )
}

export default Category
