import Image from "next/image";

export const FanClub = () => {
  return (
    <div className="bg-[#EDD4B2] w-full h-[80dvh]">
      <div className="mb-8">
        <h1 className="font-bold text-4xl text-center pt-10 pb-2">Donor Fan Club</h1>
        <p className="text-center">Thank you to all my fans for supporting me</p>
      </div>
      <div className="flex gap-20 justify-center">
        <DonorCard title="Recent Donors"/>
        <div className="flex justify-center items-center">
          <Image
            src="https://static.wikia.nocookie.net/no-game-no-life/images/d/dc/Shiro_Anime_HQ.png/revision/latest?cb=20210523001016"
            alt="no game no life"
            width={300}
            height={400}
          />
        </div>
        <DonorCard title="Top Donors"/>
      </div>
    </div>
  );
}

interface DonorCardProps {
  title: string;
};

const DonorCard: React.FC<DonorCardProps> = ({ title }) => {
  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <h1 className="font-bold text-2xl text-center pt-10 pb-2">{title}</h1>
      <h1>Jeffery Epstein</h1>
      <h1>Donald Trump</h1>
      <h1>Hillary Clinton</h1>
      <h1>Prince Andrew</h1>
      <h1>Obama</h1>
    </div>
  );
};
