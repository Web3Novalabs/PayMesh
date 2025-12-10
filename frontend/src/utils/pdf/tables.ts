import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GroupDetails } from "@/types/groups";
import { MemberStats } from "./aggregators";
import { COLORS, DISPLAY_TOKENS } from "./config";
import { getTokenName, formatAmount, formatMemberAmount } from "./formatters";

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
  const tableColumn = [
    "Date",
    "Token",
    "Total Amount",
    "Members Detail",
    "TX Hash",
  ];
  const tableRows = history.map((item) => {
    const membersDetail = item.members
      .map((m) => {
        const addr =
          m.member_address.slice(0, 6) + "..." + m.member_address.slice(-4);
        return `${addr}: ${formatMemberAmount(
          m.member_amount,
          item.token_address
        )}`;
      })
      .join("\n");

    return [
      new Date(item.paid_at).toLocaleString(),
      getTokenName(item.token_address),
      formatAmount(item.total_amount_paid, item.token_address),
      membersDetail,
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
      0: { cellWidth: 35 }, // Date
      1: { cellWidth: 20 }, // Token
      2: { cellWidth: 30 }, // Total Amount
      3: { cellWidth: "auto" }, // Members Detail
      4: { cellWidth: 30 }, // TX Hash
    },
    didDrawCell: (data) => {
      // Handle Link
      if (data.section === "body" && data.column.index === 4) {
        const txHash = data.cell.raw as string;
        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
          url: `https://voyager.online/tx/${txHash}`,
        });
      }
    },
    willDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
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
