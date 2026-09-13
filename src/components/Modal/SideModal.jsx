import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";

export default function SideModal({
  isOpen,
  onClose,
  title,
  scrollInto = null,
  children,
  width = "max-w-xl"
}) {
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
          <div className="fixed inset-0 backdrop-blur-xs bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-start z-50">
          {/*  <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl"> */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 -translate-x-full "
            enterTo="opacity-100 translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-x-0 "
            leaveTo="opacity-0 -translate-x-full"
          >
            <Dialog.Panel className={`relative transform overflow-hidden rounded-r-2xl bg-slate-300 h-[80dvh] px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full ${width} sm:p-6`}>
              <div>
                <div className="flex justify-between items-center p-4">
                  <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <XMarkIcon className="block h-6 w-6" />
                  </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
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
