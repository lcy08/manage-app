import React from "react";

import styles from "./FakturPrint.module.css";

import AR001 from "../assets/LOGO/AR001.png";
import LO002 from "../assets/LOGO/LO002.png";
import LO001 from "../assets/LOGO/LO001.png";

const logo = { AR001, LO002, LO001 };

export default function FakturPrint({ data, type }) {
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
            Yth. {data?.namaKlien || "-"}
          </div>

          <div className={styles.recipientAddress}>
            {data?.klien?.value?.alamatKlien || "-"}
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>

      {/* <!-- Title --> */}
      <div className={styles.title}>
        <h1>Faktur Harga</h1>
      </div>

      <div className={styles.info}>
        <div className={styles.number}>No: {data?.id || "—"}</div>
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
              <th>Harga Satuan</th>
              <th>Total Harga</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {data?.SJ &&
              data?.SJ.map((surat) => (
                <React.Fragment key={surat.value.id}>
                  <tr>
                    <td colSpan={7} className={styles.sjId}>
                      {surat.value.id}
                    </td>
                  </tr>
                  {surat.value.items.map((r) => (
                    <tr key={r.value?.id}>
                      <td>{r.value?.id}</td>
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
                          : r.value?.satuan?.value === "kg" &&
                              r.value.jumlahFinal
                            ? `${Math.round(parseInt(r.value?.jumlahFinal) / 25)} sak`
                            : "-"}
                      </td>
                      <td>
                        <span className={styles.total}>
                          <span className={styles.currency}>Rp.</span>
                          <span className={styles.amount}>
                            {Number(
                              parseInt(
                                r.value.hargaSatuan === null ||
                                  r.value.hargaSatuan === "" ||
                                  r.value.hargaSatuan === undefined
                                  ? 0
                                  : r.value.hargaSatuan,
                              ),
                            ).toLocaleString("id-ID")}
                            ,-
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className={styles.total}>
                          <span className={styles.currency}>Rp.</span>
                          <span className={styles.amount}>
                            {Number(
                              parseInt(r.value.hargaTotal ?? 0),
                            ).toLocaleString("id-ID")}
                            ,-
                          </span>
                        </span>
                      </td>
                      <td>{r.value.keterangan || "-"}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td>TOTAL</td>
              <td></td>
              <td>
                {(() => {
                  // Group by satuan and sum quantities

                  // WHY DOES IT JUST RETURN THE LAST DATA????????????????

                  const satuanFinal = {};
                  data?.SJ.forEach((surat) =>
                    surat.value.items.forEach((r) => {
                      const currentSatuan = r.value?.satuan?.value;

                      if (!satuanFinal[currentSatuan]) {
                        satuanFinal[currentSatuan] = 0;
                      }
                      satuanFinal[currentSatuan] +=
                        parseFloat(r.value?.jumlahFinal) || 0;
                    }),
                  );
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
                })()}
              </td>
              <td></td>
              <td></td>
              <td>
                <span className={styles.total}>
                  <span className={styles.currency}>Rp.</span>
                  <span className={styles.amount}>
                    {Number(data?.total).toLocaleString("id-ID")}
                    ,-
                  </span>
                </span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        {/* <!-- Signature Section --> */}
        <div className={styles.signatureSection}>
          <div className={styles.signatureBox}>
            <div className={styles.spacer}></div>
            <div className={styles.space}> BCA a/n. MIKI</div>
            <div className={styles.rek}> 7570292841</div>
            <div className={styles.space}> MANDIRI a/n. MIKI</div>
            <div className={styles.rek}> 1180018051986</div>
          </div>

          <div className={styles.signatureBox}>
            <div className={styles.dateLocation}>
              Jakarta,{" "}
              {(type === "view"
                ? data?.tanggalFaktur.toDate()
                : data?.tanggalFaktur
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
