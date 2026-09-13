// TODO: lazy load
import { Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ClientPage from "./pages/ClientPage/ClientPage";
import ItemPage from "./pages/ItemPage/ItemPage";
import LoginPage from "./pages/LoginPage";

import { useAuthContext } from "./hooks/useAuthContext";
import FakturPage from "./pages/FakturPage/FakturPage";
import SJForm from "./pages/SJPage/Forms/SJForm";
import SJPage from "./pages/SJPage/SJPage";
import SJView from "./pages/SJPage/Details/SJView";
import FakturForm from "./pages/FakturPage/Forms/FakturForm";
import FakturView from "./pages/FakturPage/Details/FakturView";
import SwitchPage from "./pages/SwitchPage";
import TrashPage from "./pages/TrashPage";

import HeadLayout from "./components/HeadLayout";
import { useDoc } from "./hooks/useDoc";

export default function App() {
  const { authIsReady, user, activeCId, status } = useAuthContext();
  const { document: company } = useDoc("company", activeCId)

  return (
    <div className="min-h-full">
      {authIsReady && (
        <Router>
          {user && <Navbar />}
          <Routes>
            <Route path="/" element={<Navigate to="/sj" />} />
            <Route
              path="/items"
              element={
                user ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Barang - ${company?.name}`}>
                      <ItemPage />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/sj"
              element={
                user ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Surat Jalan - ${company?.name}`}>
                      <SJPage />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/sj/add"
              element={
                user ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Tambah SJ - ${company?.name}`}>
                      <SJForm />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/sj/view"
              element={
                user ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Lihat SJ - ${company?.name}`}>
                      <SJView activeCId={activeCId} />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/faktur"
              element={
                user && status === "admin" ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Faktur - ${company?.name}`}>
                      <FakturPage />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/faktur/add"
              element={
                user && status === "admin" ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Tambah Faktur - ${company?.name}`}>
                      <FakturForm />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/faktur/view"
              element={
                user && status === "admin" ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Lihat Faktur - ${company?.name}`}>
                      <FakturView activeCId={activeCId} />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/client"
              element={
                user && status === "admin" ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Klien - ${company?.name}`}>
                      <ClientPage />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/switch"
              element={
                user && status === "admin" ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Ubah Company`}>
                      <SwitchPage />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/trashed/:type"
              element={
                user ? (
                  <Suspense
                    fallback={
                      <div className="space-y-2 animate-pulse">
                        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                        <div className="w-full h-4 bg-gray-300 rounded"></div>
                        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    }
                  >
                    <HeadLayout pageTitle={`Terhapus - ${company?.name}`}>
                      <TrashPage />
                    </HeadLayout>
                  </Suspense>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/login"
              element={!user ? <LoginPage /> : <Navigate to="/sj" />}
            />
          </Routes>
        </Router>
      )}
    </div>
  );
}
