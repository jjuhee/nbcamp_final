"use client"
import Link from "next/link"
import React, { useState } from "react"
import { IoMdSearch } from "react-icons/io"
import { VscBell } from "react-icons/vsc"
import { supabaseForClient } from "@/supabase/supabase.client"
const Header = () => {
  const [showTooltip, setShowTooltip] = useState(false)

  const onHandleClick = (event: React.MouseEvent) => {
    // 툴팁 표시 상태를 변경
    setShowTooltip(!showTooltip)
  }
  const [isAlarmData, setIsAlarmData] = useState<any>()
  const client = supabaseForClient

  const arr = []
  const channelA = client
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "projects",
      },
      (payload) => setIsAlarmData(payload),
    )
    .subscribe()

  console.log("얍얍얍", isAlarmData)

  return (
    <div className="flex w-full bg-gray-200">
      <div className="flex justify-between items-center w-[1440px] h-[108px] my-0 mx-auto">
        <Link href={"/"}>home</Link>
        <nav className="flex items-center gap-5 ml-40">
          <Link href={"/projects"}>프로젝트</Link>
          <Link href={"/members"}>인재풀</Link>
        </nav>
        <nav className="flex items-center  gap-4">
          <Link href={"/search"} className="text-lg">
            <IoMdSearch />
          </Link>
          <Link href={"/signin"}>통합로그인</Link>
          <span
            className={`text-md hover:cursor-pointer ${
              showTooltip ? "show" : ""
            }`}
            onClick={onHandleClick}
          >
            <VscBell />
            {showTooltip && (
              <div className="tooltip">
                {isAlarmData
                  ? "새로운 프로젝트가 생겼어요!"
                  : "알림이 없습니다"}
              </div>
            )}
          </span>
          <Link href={"/profile"}>마이페이지</Link>
        </nav>
      </div>
    </div>
  )
}

export default Header
