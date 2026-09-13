import styles from "./SJPrint.module.css";

import AR001 from "../../../assets/LOGO/AR001.png";
import LO002 from "../../../assets/LOGO/LO002.png";
import LO001 from "../../../assets/LOGO/LO001.png";

const logo = { AR001, LO002, LO001 };

export default function SJPrint({ data, type }) {
  return (
    <div className={styles.container}>
      {/* <!-- Header --> */}
      <div className={styles.header}>
        <div className={styles.companyInfo}>
          <img
            src={logo[data?.company?.id]}
            alt="Logo"
            className={styles.logo}
          />
          <div>
            <div className={styles.companyName}>{data?.company?.name}</div>
            <div className={styles.companyAddress}>
              {data?.company?.address}
            </div>
          </div>
        </div>

        <div className={styles.recipientInfo}>
          <div className={styles.recipientLabel}>KEPADA</div>
          <div className={styles.recipientName}>
            Yth. {data?.klien?.value?.namaKlien || "-"}
          </div>

          <div className={styles.recipientAddress}>
            {data?.klien?.value?.alamatKlien || "-"}
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>

      {/* <!-- Title --> */}
      <div className={styles.title}>
        <h1>Surat Jalan</h1>
      </div>

      {/* <!-- Info --> */}
      <div className={styles.info}>
        <div className={styles.number}>No: {data?.id || "—"}</div>
        <div className={styles.vehicleDetails}>
          <div className={styles.vehicleKind}>
            Kendaraan: {data?.jenisKendaraan}
          </div>
          <div className={styles.vehicleNumber}>No. Pol: {data?.noPol}</div>
        </div>
      </div>

      {/* <!-- Wrap table and signature together to prevent separation --> */}
      <div className={styles.tableSignatureGroup}>
        {/* <!-- Items Table --> */}
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Nama Barang</th>
              <th>Jumlah/Final</th>
              <th>Jumlah Sak</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {data?.items &&
              data?.items.map((r) => (
                <tr key={r.value.id}>
                  <td>{r.value?.id === "=" ? "=" : r.value?.id}</td>
                  <td>{r.value?.namaBarang}</td>
                  <td>
                    <>
                      <span className={styles.satuanFinal}>
                        {r.value?.jumlahFinal} {r.value?.satuan?.value}
                      </span>
                    </>
                  </td>
                  <td>
                    {r.value.isRoll.value
                      ? (!r.value.jumlahRoll || r.jumlahRoll === ""
                          ? 0
                          : r.value.jumlahRoll) + " roll"
                      : r.value?.satuan?.value === "kg" && r.value.jumlahFinal
                        ? `${Math.round(parseInt(r.value?.jumlahFinal) / 25)} sak`
                        : "-"}
                  </td>
                  <td>{r.value?.keterangan || "-"}</td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td>TOTAL</td>
              <td></td>
              <td>
                {(() => {
                  // Group by satuan and sum quantities
                  const satuanFinal = {};
                  data?.items &&
                    data?.items.forEach((r) => {
                      const currentSatuan = r.value?.satuan?.value;
                      if (!satuanFinal[currentSatuan]) {
                        satuanFinal[currentSatuan] = 0;
                      }
                      satuanFinal[currentSatuan] +=
                        parseFloat(r.value?.jumlahFinal) || 0;
                    });

                  const formatGroups = (groups) =>
                    Object.entries(groups)
                      .map(
                        ([satuan, total]) =>
                          `${total} ${satuan === "undefined" ? "" : satuan}`,
                      )
                      .join(", ");

                  // Create display string
                  return (
                    <>
                      <p>{formatGroups(satuanFinal)}</p>
                    </>
                  );
                })()}{" "}
              </td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        {/* <!-- Signature Section --> */}
        <div className={styles.signatureSection}>
          <div className={styles.signatureBox}>
            <div className={styles.recipientBoxSpace}>
              Jakarta
            </div>
            <div>Penerima :</div>
            <div className={styles.senderName}>
              (_________________________)
            </div>
          </div>

          <div className={styles.signatureBox}>
            <div className={styles.dateLocation}>
              Jakarta,{" "}
              {(type === "view"
                ? data?.tanggalSJ.toDate()
                : data?.tanggalSJ
              )?.toLocaleString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div>Pengirim :</div>
            <div className={styles.senderName}>
              {data?.company?.name || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
