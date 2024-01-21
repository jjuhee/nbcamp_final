import React from "react"
import { useQuery } from "@tanstack/react-query"
import { getUser } from "../../api"
import { TbPointFilled } from "react-icons/tb"

const ProfileUserData = ({ profileId }: { profileId: string }) => {
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", profileId],
    queryFn: () => getUser(profileId),
    enabled: !!profileId,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>유저데이터를 불러오는 중 오류가 발생했습니다</div>
  }

  return (
    <div className="pt-3">
      {/* 유저 데이터 */}
      <div className="flex items-center">
        <img
          width={64}
          height={64}
          src={`${users?.avatar_url}`}
          alt="User Avatar"
          className="w-64 h-64 rounded-full"
        />

        <div className="text-left pl-[40px]">
          <h2 className="text-[30px] pl-[10px] font-bold">
            {users?.user_nickname}
          </h2>

          <div className="flex justify-between items-center w-[700px]">
            <div className="p-[10px]">
              <div className="h-[100px]">
                <p className="text-[18px] pb-[10px] font-semibold">연락처</p>
                {users?.user_phone_number ? (
                  <p className="text-[20px] font-bold">
                    {users.user_phone_number}
                  </p>
                ) : (
                  <p className="text-[20px] font-semibold">
                    연락처 정보가 없습니다.
                  </p>
                )}
              </div>

              <div>
                <p className="text-[18px] pb-[10px] font-semibold">직무</p>
                {users?.positions?.name ? (
                  <p className="text-[20px] font-bold">
                    {users.positions.name}
                  </p>
                ) : (
                  <p className="text-[20px] font-semibold">
                    직무 정보가 없습니다.
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="h-[100px]">
                <p className="text-[18px] pb-[10px] font-semibold">이메일</p>
                <p className="text-[20px] font-bold">{users?.user_email}</p>
              </div>
              <div>
                <p className="text-[18px] pb-[10px] font-semibold">유저 상태</p>
                <p className="flex text-[20px] font-bold">
                  {users?.user_status === "휴식 중" && (
                    <TbPointFilled className="text-[30px] text-black" />
                  )}
                  {users?.user_status === "지원 중" && (
                    <TbPointFilled className="text-[30px] text-pink-500" />
                  )}
                  {users?.user_status === "참여 중" && (
                    <TbPointFilled className="text-[30px] text-gray-500" />
                  )}
                  {users?.user_status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="my-8 border-t-2 border-gray-300" />

      {/* 기술 스텍 보여주기 */}
      <div>
        <h2 className="text-[26px] font-bold">보유기술</h2>
        {users?.user_tech && users.user_tech.length > 0 ? (
          <span className="flex gap-3 pt-3">
            {users.user_tech.map((tech) => (
              <p
                key={tech.techs?.tech_name}
                className="border border-[#297A5F] rounded-full p-2 font-bold text-[#297A5F] text-lg pr-3 pl-3"
              >
                {tech.techs?.tech_name}
              </p>
            ))}
          </span>
        ) : (
          <p className="pt-[30px]">보유 기술이 없습니다.</p>
        )}
        <hr className="my-8 border-t-2 border-gray-300" />
      </div>

      {/* 간단 소개글 */}
      <div>
        <h2 className="text-[26px] font-bold pb-[40px]">간단 소개글</h2>
        {users?.user_comment ? (
          <p>{users.user_comment}</p>
        ) : (
          <p>소개글이 없습니다.</p>
        )}
        <hr className="my-8 border-t-2 border-gray-300" />
      </div>
    </div>
  )
}

export default ProfileUserData
