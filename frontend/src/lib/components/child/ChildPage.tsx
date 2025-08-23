"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react";
import { ChildInfo } from "./components/ChildInfo";
import { Child } from "./shared/types/Child";


const Posts = () => {
  return (
    <div>
      TODO: Post feed
    </div>
  );
}

const FanClub = () => {
  return (
    <div className="bg-[#EDD4B2] w-full h-[80dvh]">
      <div className="mb-8">
        <h1 className="font-bold text-4xl text-center pt-10 pb-2">Donor Fan Club</h1>
        <p className="text-center">Thank you to all my fans for supporting me</p>
      </div>
      <div className="flex gap-20 justify-center">
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="font-bold text-2xl text-center pt-10 pb-2">Recent Donors</h1>
          <h1>Jeffery Epstein</h1>
          <h1>Donald Trump</h1>
          <h1>Hillary Clinton</h1>
          <h1>Prince Andrew</h1>
          <h1>Obama</h1>
        </div>
        <div className="flex justify-center items-center">
          <Image
            src="https://static.wikia.nocookie.net/no-game-no-life/images/d/dc/Shiro_Anime_HQ.png/revision/latest?cb=20210523001016"
            alt="no game no life"
            width={300}
            height={400}
          />
        </div>
        <div className="flex flex-col gap-2 justify-center items-center">
          <h1 className="font-bold text-2xl text-center pt-10 pb-2">Top Donors</h1>
          <h1>Jeffery Epstein</h1>
          <h1>Donald Trump</h1>
          <h1>Hillary Clinton</h1>
          <h1>Prince Andrew</h1>
          <h1>Obama</h1>
        </div>
      </div>
    </div>
  );
}

export const ChildPage = () => {
  const searchParams = useSearchParams();
  const childId = searchParams.get("id");

  const [child, setChild] = useState<Child>();

  const fetchChild = async () => {
    const response = await fetch(`http://localhost:8080/api/v1/children/${childId}`);
    const childBody = await response.json();
    setChild(childBody);
  };

  useEffect(() => {
    fetchChild();
  }, [])

  return (
    <div className="flex flex-col w-full justify-center items-center">
      <div className="flex flex-col h-[80dvh]">
        <ChildInfo child={child}/>
      </div>
      <FanClub/>

      <div className="flex flex-col justify-center">
        <Posts/>
      </div>
    </div>
  );
}
