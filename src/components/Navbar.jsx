import { useState, useCallback } from "react";
import { NavLink /* useNavigate */, useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";

import MP001 from "../assets/LOGO/MP001.png";
import BG001 from "../assets/LOGO/BG001.png";
import LO001 from "../assets/LOGO/LO001.png";
import { ChevronDown } from "lucide-react";

const logo = { MP001, BG001, LO001 };

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuMobile, setAdminMenuMobile] = useState(false);

  const { activeCId, displayName, status } = useAuthContext();
  const { logout, isPending } = useLogout();

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
    setAdminMenuMobile(false);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const [adminMenu, setAdminMenu] = useState(false);

  return (
    <>
      <nav className={`bg-gray-100`} style={{ contain: "layout style" }}>
        <div className="px-4 mx-auto max-w-8xl sm:px-6 lg:px-8 z-100">
          <div className="flex justify-between h-15">
            <div className="flex">
              <img
                src={logo[activeCId]}
                alt="LOGO"
                className="relative h-12 my-2 mr-4 p-0.5"
              />

              <div className="hidden md:flex">
                <div className="flex items-center gap-3 shrink-0">
                  {status === "admin" && (
                    <NavLink
                      to="/client"
                      end
                      className={({ isActive }) =>
                        `inline-flex items-center px-2 py-5 border-b-2 text-sm font-medium ${
                          isActive
                            ? "border-blue-500 bg-blue-100 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }`
                      }
                    >
                      Daftar Klien
                    </NavLink>
                  )}
                  <NavLink
                    to="/items"
                    end
                    className={({ isActive }) =>
                      `inline-flex items-center px-2 py-5 border-b-2 text-sm font-medium ${
                        isActive
                          ? "border-blue-500 bg-blue-100 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`
                    }
                  >
                    Barang Masuk-Keluar
                  </NavLink>
                  <NavLink
                    to="/sj"
                    className={({ isActive }) =>
                      `items-center px-2 py-5 border-b-2 text-sm font-medium ${
                        isActive
                          ? "border-blue-500 bg-blue-100 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`
                    }
                  >
                    Surat Jalan
                  </NavLink>
                  {status === "admin" && (
                    <NavLink
                      to="/faktur"
                      className={({ isActive }) =>
                        `inline-flex items-center px-2 py-5 border-b-2 text-sm font-medium ${
                          isActive
                            ? "border-blue-500 bg-blue-100 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }`
                      }
                    >
                      Faktur
                    </NavLink>
                  )}
                </div>
              </div>
            </div>
            <div
              className="hidden md:block"
              onClick={() => {
                setAdminMenu(!adminMenu);
              }}
            >
              <div className="relative flex ml-3">
                <div className="z-20 flex items-center justify-between w-40 p-3 mr-3 bg-gray-100 border-gray-300 cursor-pointer border-x">
                  <div>
                    <p className="text-sm text-nowrap">Hei, {displayName}</p>
                    <p className="text-xs text-gray-600">{status}</p>
                  </div>
                  <div>
                    <ChevronDown
                      className={`w-4 transition-all duration-300 ${adminMenu ? "-rotate-180" : "rotate-0"}`}
                    />
                  </div>
                </div>
                <div
                  className={`absolute w-40 left-0 top-full bg-gray-100 border-gray-300 border-b-2 shadow rounded-b-lg p-2 transition-all duration-300 -z-10 ${
                    adminMenu
                      ? "transition-y-0 opacity-100"
                      : "-translate-y-full opacity-0 pointer-events-none"
                  }`}
                >
                  {status === "admin" && (
                    <div
                      className="py-1 pl-1 text-blue-500 border-b border-gray-300 cursor-pointer hover:font-bold"
                      onClick={() => navigate("/switch")}
                    >
                      Ubah Company
                    </div>
                  )}
                  {/* <div className="py-1 pl-1 border-b border-gray-300 cursor-pointer">
                  Tambah user
                </div> */}
                  {!isPending && (
                    <div
                      className="py-2 pl-1 text-red-500 border-b border-gray-300 cursor-pointer hover:font-bold"
                      onClick={handleLogout}
                    >
                      Logout
                    </div>
                  )}
                  {isPending && (
                    <div
                      className="p-2 my-3 text-red-200 cursor-not-allowed rounded-xl"
                      disabled
                    >
                      Loading...
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* NOTE: MOBILE MENU */}
            <div className="flex items-center mr-2 md:hidden">
              <div
                onClick={() => {
                  setAdminMenuMobile(!adminMenuMobile);
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center justify-center p-2 text-gray-700 transition-all rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 duration-50"
              >
                <p className="pr-2 mr-1 border-r border-gray-400">
                  {displayName}
                </p>
                <ChevronDown
                  className={`w-4 transition-all duration-300 ${adminMenuMobile ? "rotate-90" : "-rotate-90"}`}
                />
              </div>
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 text-gray-400 transition-all rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 duration-50"
              >
                <span className={`sr-only`}>Open main menu</span>
                <div className="relative w-6 h-6 ">
                  <XMarkIcon
                    className={`absolute inset-0 transition-all duration-300 ${
                      mobileMenuOpen
                        ? "opacity-100 rotate-0"
                        : "opacity-0 -rotate-180"
                    }`}
                  />

                  <Bars3Icon
                    className={`absolute inset-0 transition-all duration-300 ${
                      mobileMenuOpen
                        ? "opacity-0 rotate-180"
                        : "opacity-100 rotate-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden absolute left-0 z-100 top-full w-full transition-all duration-300 ${mobileMenuOpen ? "opacity-90 translate-x-0" : "opacity-0 translate-x-full  pointer-events-none"}`}
          style={{ contain: "layout style" }}
        >
          <div className="pt-2 pb-3 space-y-1 border-b border-gray-300 bg-gray-50">
            {status === "admin" && (
              <NavLink
                to="/client"
                end
                onClick={toggleMobileMenu}
                className={({ isActive }) =>
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Daftar Klien
              </NavLink>
            )}
            <NavLink
              to="/items"
              end
              onClick={toggleMobileMenu}
              className={({ isActive }) =>
                `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              Barang Masuk-Keluar
            </NavLink>
            <NavLink
              to="/sj"
              onClick={toggleMobileMenu}
              className={({ isActive }) =>
                `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              Surat Jalan
            </NavLink>{" "}
            {status === "admin" && (
              <NavLink
                to="/faktur"
                onClick={toggleMobileMenu}
                className={({ isActive }) =>
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  }`
                }
              >
                Faktur
              </NavLink>
            )}
          </div>
        </div>

        <div
          className={`md:hidden fixed left-0 top-full w-full transition-all duration-300 z-100 ${adminMenuMobile ? "translate-x-0 opacity-80" : "-translate-x-full opacity-0 pointer-events-none"}`}
          style={{ contain: "layout style" }}
        >
          <div className="border-t border-b border-gray-300 bg-gray-50">
            <div className="flex-row space-y-1 justify-items-end">
              <div className="w-full">
                <div className="block py-2 pl-3 pr-4 text-base font-medium text-right text-gray-800 border-r-4 border-gray-500 bg-gray-50">
                  <p className="">Hei, {displayName}</p>
                  <p className="text-gray-500">{status}</p>
                </div>
                {status === "admin" && (
                  <div
                    className="block py-2 pl-3 pr-4 text-base font-medium text-right text-blue-700 border-r-4 border-blue-500"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAdminMenuMobile(false);
                      navigate("/switch");
                    }}
                  >
                    Ubah Company
                  </div>
                )}
                {!isPending && (
                  <p
                    className="block py-2 pl-3 pr-4 text-base font-medium text-right text-red-700 border-r-4 border-red-500"
                    onClick={handleLogout}
                  >
                    Logout
                  </p>
                )}
                {isPending && (
                  <p className="block py-2 pl-3 pr-4 text-base font-medium border-r-4">
                    Loading...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* {(mobileMenuOpen || adminMenuMobile) &&
        createPortal(
          <div
            className="fixed inset-0 z-10 bg-black/20"
            onClick={() => {
              setMobileMenuOpen(false);
              setAdminMenuMobile(false);
            }}
          />,
          document.body,
        )} */}
    </>
  );
}
