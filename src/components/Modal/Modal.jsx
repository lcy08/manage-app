import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";

export default function Modal({ isOpen, onClose, title, scrollInto=null, children }) {
  // useEffect(() => {
  //   document.body.style.overflow = "hidden";
  //   return () => {
  //     document.body.style.overflow = "";
  //   };
  // }, []);

  return (
    <Transition.Root show={isOpen} as={Fragment} afterEnter={scrollInto}>
      <Dialog as="div" className="relative z-100" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-opacity-75 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         {/*  <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl"> */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div>
                  <div className="flex items-center justify-between p-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button
                      onClick={onClose}
                      className="text-gray-500 cursor-pointer hover:text-gray-700"
                    >
                      <XMarkIcon className="block w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        {/* </div> */}
      </Dialog>
    </Transition.Root>
  );
}
