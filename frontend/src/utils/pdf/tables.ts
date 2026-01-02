import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GroupDetails } from "@/types/groups";
import { MemberStats } from "./aggregators";
import { COLORS, DISPLAY_TOKENS } from "./config";
import { getTokenName, formatAmount } from "./formatters";

export const drawMembersTable = (
  doc: jsPDF,
  memberStats: MemberStats[],
  startY: number
) => {
  const memberTableColumns = ["Member", "Share %", ...DISPLAY_TOKENS];
  const memberTableRows = memberStats.map((stats) => {
    const shortAddr =
      stats.address.slice(0, 6) + "..." + stats.address.slice(-4);
    const row = [shortAddr, `${stats.percentage}%`];

    DISPLAY_TOKENS.forEach((token) => {
      const val = stats.tokens[token] || 0;
      row.push(val.toFixed(2));
    });
    return row;
  });

  autoTable(doc, {
    head: [memberTableColumns],
    body: memberTableRows,
    startY: startY,
    theme: "striped",
    headStyles: {
      fillColor: COLORS.header,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      textColor: COLORS.text,
      lineWidth: 0,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Member
      1: { cellWidth: 20 }, // Share %
      // Others auto
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable.finalY;
};

export const drawHistoryTable = (
  doc: jsPDF,
  history: GroupDetails["history"],
  startY: number
) => {
  const tableColumn = ["Date", "Token", "Total Amount", "TX Hash"];
  const tableRows = history.map((item) => {
    const tokenName = getTokenName(item.token_address);

    return [
      new Date(item.paid_at).toLocaleString(),
      tokenName,
      formatAmount(item.total_amount_paid, tokenName),
      item.tx_hash,
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    theme: "striped",
    headStyles: {
      fillColor: COLORS.header,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2,
      textColor: COLORS.text,
      overflow: "linebreak",
      valign: "top",
      lineWidth: 0,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Date
      1: { cellWidth: 20 }, // Token
      2: { cellWidth: 40 }, // Total Amount
      3: { cellWidth: 60 }, // TX Hash
    },
    didDrawCell: (data) => {
      // Handle Link
      if (data.section === "body" && data.column.index === 3) {
        const txHash = data.cell.raw as string;
        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
          url: `https://voyager.online/tx/${txHash}`,
        });
      }
    },
    willDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const txHash = data.cell.raw as string;
        if (txHash.length > 10) {
          data.cell.text = [txHash.slice(0, 4) + "..." + txHash.slice(-4)];
        }
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable.finalY;
};
