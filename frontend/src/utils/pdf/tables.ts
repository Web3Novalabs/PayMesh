import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HistoryItem } from "@/types/groups";
import { COLORS, DISPLAY_TOKENS } from "./config";
import { getTokenName, formatAmount, formatMemberAmount } from "./formatters";

export const drawMembersTable = (
  doc: jsPDF,
  memberStats: { [addr: string]: { [token: string]: number } },
  startY: number
) => {
  const head = [["Member Address", ...DISPLAY_TOKENS]];
  const body = Object.entries(memberStats).map(([addr, tokens]) => {
    const row = [
      `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`,
    ];
    DISPLAY_TOKENS.forEach((t) => {
      const val = tokens[t] || 0;
      row.push(
        val > 0 ? val.toFixed(t === "ETH" || t === "WBTC" ? 6 : 2) : "-"
      );
    });
    return row;
  });

  autoTable(doc, {
    startY,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: [COLORS.header[0], COLORS.header[1], COLORS.header[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
    },
  });

  // @ts-expect-error jspdf-autotable adds lastAutoTable
  return doc.lastAutoTable.finalY;
};

export const drawHistoryTable = (
  doc: jsPDF,
  history: HistoryItem[],
  startY: number
) => {
  const head = [
    [
      "Date",
      "Token",
      "Total Amount",
      "Members Detail (Addr: Share% - Amt)",
      "TX Hash",
    ],
  ];

  const body = history.map((item) => {
    const tokenName = getTokenName(item.token_address);
    const dateStr = new Date(item.paid_at).toLocaleDateString();
    const amountStr = formatAmount(item.total_amount_paid, tokenName);

    // Format members details into a single cell string
    // e.g. "0x123...: 50% - 100 USDC\n0x456...: 50% - 100 USDC"
    const membersDetail = item.members
      .map((m) => {
        const addrShort = `${m.member_address.substring(
          0,
          4
        )}...${m.member_address.substring(m.member_address.length - 4)}`;
        const amt = formatMemberAmount(m.member_amount, tokenName);
        return `${addrShort}: ${m.member_percentage}% - ${amt}`;
      })
      .join("\n");

    const txShort = `${item.tx_hash.substring(0, 6)}...${item.tx_hash.substring(
      item.tx_hash.length - 4
    )}`;

    return [dateStr, tokenName, amountStr, membersDetail, txShort];
  });

  autoTable(doc, {
    startY,
    head,
    body,
    theme: "grid",
    headStyles: {
      fillColor: [COLORS.header[0], COLORS.header[1], COLORS.header[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 15 }, // Token
      2: { cellWidth: 25 }, // Amount
      3: { cellWidth: 85 }, // Members (Wide)
      4: { cellWidth: 30 }, // TX Hash
    },
    didDrawCell: (data) => {
      // Add link to TX Hash column (index 4)
      if (data.section === "body" && data.column.index === 4) {
        const rowIndex = data.row.index;
        const txHash = history[rowIndex].tx_hash;
        const linkUrl = `https://voyager.online/tx/${txHash}`;
        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
          url: linkUrl,
        });
      }
    },
  });

  // @ts-expect-error jspdf-autotable adds lastAutoTable
  return doc.lastAutoTable.finalY + 10;
};
