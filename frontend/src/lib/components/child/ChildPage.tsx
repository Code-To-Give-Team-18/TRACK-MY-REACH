"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"

const DonateButton = () => {
  return (
    <div>Donate</div>
  );
}

const RecentDonations = () => {
  return (
    <div>
      <p>Dost1</p>
      <p>Dost2</p>
      <p>Dost3</p>
    </div>
  );
}

const Posts = () => {
  return (
    <div>
      <p>post1</p>
      <p>post2</p>
      <p>post3</p>
    </div>
  );
}

const ChildInfo = () => {
  return(
    <div className="flex flex-col">
      <h1>Jenny</h1>
      <Image src="https://static.wikia.nocookie.net/no-game-no-life/images/d/dc/Shiro_Anime_HQ.png/revision/latest?cb=20210523001016" alt="no gameno life" width={100} height={100}/>
      <p>
        Lorum ipsum dolor sit amen
      </p>
    </div>
  );
}

export const ChildPage = () => {
  const searchParams = useSearchParams();
  const childId = searchParams.get("id");

  return (
    <div className="flex">
      <div className="flex flex-col">
        <ChildInfo />
      </div>
      <div className="flex flex-col">
        <DonateButton/>
        <RecentDonations/>
        <Posts/>
      </div>
    </div>
  );
}
