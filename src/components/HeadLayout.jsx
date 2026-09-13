import { Helmet } from "react-helmet-async";

export default function HeadLayout({
  children,
  pageTitle = "Warehouse",
}) {
  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <main>{children}</main>
    </div>
  );
}
