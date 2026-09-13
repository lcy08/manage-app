import AR001 from "../assets/LOGO/AR001.png";
import LO002 from "../assets/LOGO/LO002.png";
import LO001 from "../assets/LOGO/LO001.png";
import { useAuthContext } from "../hooks/useAuthContext";
import { useFirestore } from "../hooks/useFirestore";
import { useNavigate } from "react-router-dom";

const logo = { AR001, LO002, LO001 };

export default function SwitchPage() {
  const { user, compList, activeCId } = useAuthContext();
  const navigate = useNavigate();

  const { updateDocument } = useFirestore("users");

  const handleChange = async (company) => {
    if (company === activeCId) {
      navigate("/sj");
    } else {
      const { success, error } = await updateDocument(user.uid, {
        activeCId: company,
      });
      if (success) {
        navigate("/sj");
        navigate(0);
      }
      if (error) {
        console.error(error);
        alert(error.message);
      }
    }
  };

  return (
    <div className="h-[90dvh] justify-center items-center flex flex-col overflow-hidden">
      <div className="text-center text-2xl mb-5">Perusahaan</div>
      <div className="flex flex-col md:flex-row justify-around gap-y-2 gap-x-4 overflow-y-auto">
        {compList?.map((company) => (
          <div
            className="justify-center flex flex-col items-center"
            key={company}
          >
            <div
              className={`${activeCId === company ? "border-blue-200 bg-blue-100" : "border-gray-200"} border p-3 rounded-2xl justify-center flex w-45 h-45`}
            >
              <img
                src={logo[company]}
                alt="LOGO"
                className="relative object-contain"
              />
            </div>
            <button
              className="bg-green-400 hover:bg-green-500 w-full p-2 cursor-pointer rounded-2xl mt-2 mb-4"
              onClick={() => handleChange(company)}
            >
              Buka
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
