"use client"

import { useRouter } from "next/navigation";
import { useChildContext } from "../contexts/ChildContext";

export const DonateButton = () => {

  const router = useRouter();
  const { child } = useChildContext();

  const handleDonationRedirect = () : void => {
    router.push(`/checkout_iv?childId=${child?.id}`);
  };

  return (
    <button
      className="py-[12px] px-[20px] bg-[#F1204A] hover:bg-[#2DCCD3] text-white hover:text-black font-semibold"
      style={{
        borderRadius: "12px",
        transitionDuration: "0.3s",
      }}
      onClick={() => handleDonationRedirect()}
    >
      Donate now
    </button>
  );
}
