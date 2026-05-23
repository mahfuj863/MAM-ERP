/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Transaction, Movement, Supplier, PurchaseOrder, Customer } from "./types";

export const initialProducts: Product[] = [
  {
    sku: "AUD-HD-2024-PX",
    name: "Premium Headset X2",
    category: "Electronics",
    stockLevel: 24,
    minStockLevel: 500,
    reorderPoint: 750,
    costPrice: 145.0,
    sellPrice: 129.0, // or 129.00
    suggestedMsrp: 329.0,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI9gmr6_qcX8XppitjEYH2hWmDlHbE2F7zpEq3yGDwaTXUlB3hzzX1_Nnmllt-vZnDL_Zwq9GLmT85_76uHyUpaPhVEP9dIbogn6_Pkq1Xd6I-5N3RGZ9ShPgLhRc-DfZyZEt-xTGdVFHTRc4dSAa0tj4KXY7FWgnWGt6IXUKmG9IXREiPIjMyb3XsW-4X7NH9EZXzg91DGGG6luJyNGddvD9ThMLNyO80aEaIjuAF0_E5ZXRqM7QonlCkqmBLRQ9QdoBOLZ2ZasBh",
    location: "Zone A - Shelf 12-B",
    status: "Healthy",
    description: "High-fidelity active noise-cancelling headphones with 40-hour battery life and premium leather finishes."
  },
  {
    sku: "BOTT-4412",
    name: "Eco-Glass Flask",
    category: "Beverages",
    stockLevel: 156,
    minStockLevel: 50,
    reorderPoint: 100,
    costPrice: 12.0,
    sellPrice: 25.5,
    suggestedMsrp: 29.99,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxfxiYylV6iq0cwLiqNW1PKXAL0qN22qJstYBMcF33i3sTxi1m0L2561aNAxNkIS_J9PXXNB5zS31pRcxrrwXoX4LW1flqunDAN7sjNC64RlMhA3DGgFxe5x4JRd6fVsEzlwIHAck0vxsHmQ6X34eT2xURWLqnN2JP5veuP_xX1f7VCFF_p50fSqa5PWsiz4b3wNO2tn55J0mXjsYTbs8D4d6ME1w7qk1DrZz5sc6ZhJwWZDFj2I6QWBPaBRkN1N7vHNhhg_vaIifk",
    location: "Zone A - Shelf 3",
    status: "Healthy",
    description: "A minimalist glass water bottle with a bamboo lid, sitting on a polished light grey surface."
  },
  {
    sku: "MOUS-0091",
    name: "Precision Mouse V3",
    category: "Electronics",
    stockLevel: 5,
    minStockLevel: 20,
    reorderPoint: 35,
    costPrice: 28.0,
    sellPrice: 54.0,
    suggestedMsrp: 59.99,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTDyiMMfQn8IYyKjaW6yLYMBZMPUveGwXjEmh6Cx30rvQ6qSujnHaNgF3uomkXZ4CbVlaDLC2P3BfCL9hwj69mfYSm5b_lzkl5tPrdVTuWKp6FfpSMG-B_knyxeYv9K3Tvhw26B8zZl8rc8uR8wxqURuSIwG3jvFH8dpDWaT5L93Fm9yEBkJUwTewZluD_KqoDl8Bpek_Bq6UnNIOGQqOhRL7ENKswV5okaTXQ3s0pf4ulX2xTNVwC1Apx0DXcUjdr97VHVoAgP8ko",
    location: "Zone B - Shelf 5-A",
    status: "Low Stock",
    description: "Sleek and modern ergonomic computer mouse in a minimalist white and silver finish."
  },
  {
    sku: "COFF-2287",
    name: "Artisan Coffee Beans",
    category: "Beverages",
    stockLevel: 42,
    minStockLevel: 10,
    reorderPoint: 25,
    costPrice: 8.5,
    sellPrice: 18.0,
    suggestedMsrp: 22.0,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDV5oHemXdQ2uK-LFxTvL_YrDWz19PXZkQgjBBOKfZPegS_oC0VxKWtGingqpumV7cRheUOz78mnYy_vgSWTK89WhZ17fJRfbEfNRofjMKpqXsiWddjWIc7ckkIGpLzI_ak5GIbJ4Q0BYUsuqS1vS2cs35KDTBlwc50oTsy8Qfjr0marLlDCM2b0zarG8aRDvFwmh6R3jCm3OAqejNCUdlZYTV4Pj5ncy0iMm6Pc0-KwEWaWoe9IiwVkoJVDUC9tERBCGLykRTqsHXn",
    location: "Zone C - Shelf 2-B",
    status: "Healthy",
    description: "A clean presentation of organic espresso beans in a modern, matte-finish kraft bag."
  },
  {
    sku: "WATC-3321",
    name: "Smart Watch Elite",
    category: "Electronics",
    stockLevel: 12,
    minStockLevel: 5,
    reorderPoint: 10,
    costPrice: 95.0,
    sellPrice: 199.0,
    suggestedMsrp: 249.00,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDh-MbETXi7DqEfo_tkfrL06moMK_M4Vu2WYkT9We_EipOIxF5rmaDvXMPtQNUurKklumYrzgG3c90d2GgGt4ll-lmIX3uojaob5r7mCjWhYTadHxP2RCt6Jy8eCPVidsNpeSpIBKQQSbivRrdeYb8MBaGum0LyEVm5HVBR-i_HBZ964FfIIdFKnXYOl15oU8-KOOVdcv7puGS_KFeNChJP6MINn9cI4r09tMHycy4_Gp-B4o5Mx_o9-UyJfikiqB0JkYyNCFQvWrG_",
    location: "Zone A - Shelf 1",
    status: "Healthy",
    description: "Sleek white and grey smart watch with a vibrant digital display showing health metrics."
  },
  {
    sku: "ENT-7482-A",
    name: "Cisco Catalyst 9300",
    category: "Networking",
    stockLevel: 482,
    minStockLevel: 100,
    reorderPoint: 200,
    costPrice: 850.0,
    sellPrice: 2499.0,
    suggestedMsrp: 2999.0,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI9gmr6_qcX8XppitjEYH2hWmDlHbE2F7zpEq3yGDwaTXUlB3hzzX1_Nnmllt-vZnDL_Zwq9GLmT85_76uHyUpaPhVEP9dIbogn6_Pkq1Xd6I-5N3RGZ9ShPgLhRc-DfZyZEt-xTGdVFHTRc4dSAa0tj4KXY7FWgnWGt6IXUKmG9IXREiPIjMyb3XsW-4X7NH9EZXzg91DGGG6luJyNGddvD9ThMLNyO80aEaIjuAF0_E5ZXRqM7QonlCkqmBLRQ9QdoBOLZ2ZasBh",
    location: "Zone B - Shelf 14",
    status: "Healthy",
    description: "Enterprise stackable layer 3 switch, 48 ports multigigabit, modular uplink options."
  },
  {
    sku: "ENT-1120-X",
    name: "MacBook Pro M3 Max",
    category: "Workstation",
    stockLevel: 12,
    minStockLevel: 10,
    reorderPoint: 15,
    costPrice: 2800.0,
    sellPrice: 3499.0,
    suggestedMsrp: 3999.0,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI9gmr6_qcX8XppitjEYH2hWmDlHbE2F7zpEq3yGDwaTXUlB3hzzX1_Nnmllt-vZnDL_Zwq9GLmT85_76uHyUpaPhVEP9dIbogn6_Pkq1Xd6I-5N3RGZ9ShPgLhRc-DfZyZEt-xTGdVFHTRc4dSAa0tj4KXY7FWgnWGt6IXUKmG9IXREiPIjMyb3XsW-4X7NH9EZXzg91DGGG6luJyNGddvD9ThMLNyO80aEaIjuAF0_E5ZXRqM7QonlCkqmBLRQ9QdoBOLZ2ZasBh",
    location: "Zone A - Vault 2",
    status: "Low Stock",
    description: "Apple MacBook Pro 16-inch, M3 Max chip, 48GB Unified Memory, 1TB SSD, Space Black."
  },
  {
    sku: "ENT-9004-B",
    name: "Dell PowerEdge R750",
    category: "Server",
    stockLevel: 0,
    minStockLevel: 2,
    reorderPoint: 4,
    costPrice: 4200.0,
    sellPrice: 6500.0,
    suggestedMsrp: 7500.0,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI9gmr6_qcX8XppitjEYH2hWmDlHbE2F7zpEq3yGDwaTXUlB3hzzX1_Nnmllt-vZnDL_Zwq9GLmT85_76uHyUpaPhVEP9dIbogn6_Pkq1Xd6I-5N3RGZ9ShPgLhRc-DfZyZEt-xTGdVFHTRc4dSAa0tj4KXY7FWgnWGt6IXUKmG9IXREiPIjMyb3XsW-4X7NH9EZXzg91DGGG6luJyNGddvD9ThMLNyO80aEaIjuAF0_E5ZXRqM7QonlCkqmBLRQ9QdoBOLZ2ZasBh",
    location: "Zone C - Server Bay 4",
    status: "Out of Stock",
    description: "Dell high-density rack server, dual Intel Xeon processors, modular hot-plug capabilities."
  },
  {
    sku: "ENT-2230-C",
    name: "Logitech MX Master 3S",
    category: "Peripherals",
    stockLevel: 156,
    minStockLevel: 20,
    reorderPoint: 50,
    costPrice: 55.0,
    sellPrice: 99.0,
    suggestedMsrp: 99.0,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTDyiMMfQn8IYyKjaW6yLYMBZMPUveGwXjEmh6Cx30rvQ6qSujnHaNgF3uomkXZ4CbVlaDLC2P3BfCL9hwj69mfYSm5b_lzkl5tPrdVTuWKp6FfpSMG-B_knyxeYv9K3Tvhw26B8zZl8rc8uR8wxqURuSIwG3jvFH8dpDWaT5L93Fm9yEBkJUwTewZluD_KqoDl8Bpek_Bq6UnNIOGQqOhRL7ENKswV5okaTXQ3s0pf4ulX2xTNVwC1Apx0DXcUjdr97VHVoAgP8ko",
    location: "Zone B - Shelf 12-B",
    status: "Optimal",
    description: "Premium office performance mouse with high precision sensor and magnetic scroll wheel."
  },
  {
    sku: "ENT-5512-Y",
    name: "Ubiquiti UniFi AP 6",
    category: "Networking",
    stockLevel: 92,
    minStockLevel: 20,
    reorderPoint: 40,
    costPrice: 110.0,
    sellPrice: 179.0,
    suggestedMsrp: 199.0,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDh-MbETXi7DqEfo_tkfrL06moMK_M4Vu2WYkT9We_EipOIxF5rmaDvXMPtQNUurKklumYrzgG3c90d2GgGt4ll-lmIX3uojaob5r7mCjWhYTadHxP2RCt6Jy8eCPVidsNpeSpIBKQQSbivRrdeYb8MBaGum0LyEVm5HVBR-i_HBZ964FfIIdFKnXYOl15oU8-KOOVdcv7puGS_KFeNChJP6MINn9cI4r09tMHycy4_Gp-B4o5Mx_o9-UyJfikiqB0JkYyNCFQvWrG_",
    location: "Zone B - Shelf 3",
    status: "Healthy",
    description: "High-performance ceiling-mounted Wi-Fi 6 access point designed for massive networks."
  }
];

export const initialTransactions: Transaction[] = [
  {
    invoiceId: "INV-2024-001",
    customerName: "Acme Corp Ltd.",
    date: "Oct 24, 2024 • 14:30",
    amount: 1240.0,
    status: "PAID",
    paymentMode: "Cash"
  },
  {
    invoiceId: "INV-2024-002",
    customerName: "Michael Chen",
    date: "Oct 24, 2024 • 12:15",
    amount: 45.5,
    status: "PAID",
    paymentMode: "Card"
  },
  {
    invoiceId: "INV-2024-003",
    customerName: "Sarah Jenkins",
    date: "Oct 24, 2024 • 10:45",
    amount: 210.0,
    status: "PENDING",
    paymentMode: "Credit"
  },
  {
    invoiceId: "INV-2024-004",
    customerName: "Global Logistics Co.",
    date: "Oct 23, 2024 • 16:20",
    amount: 3450.0,
    status: "OVERDUE",
    paymentMode: "Credit"
  }
];

export const initialMovements: Movement[] = [
  {
    id: "mov-1",
    date: "Oct 24, 2023",
    time: "14:22 PM",
    sku: "APPLE-MAC-M2-14",
    description: 'MacBook Pro 14" M2 Max',
    type: "IN",
    quantity: 45,
    referenceId: "PO-88291",
    executedBy: "John Doe",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgTTqIVF6TUD_6JA0g8oTepD7LWTn7p5Jy2EaiBoRxxAdJvXM-QAhXcDWcUlIPAM69PvvDOwYhJS9b6hcvoq1t4-wFF1-a8w-0lhkHH19AM5FmaHUhk9uWgqAQqkZAtz5J3QJwj9oV3yunL2jkpOWUk8_JG4lM7QiA023RGQBZJ8P7UzRKsojMgiYViPqd6tmEoNbdtq5JuAglOoRqFmZWg2C97KJe-R7Exi6Y-0dny0p4Yp0EnzNCtyKyI4IffZSwfeIOGF7jWJ9L"
  },
  {
    id: "mov-2",
    date: "Oct 24, 2023",
    time: "13:05 PM",
    sku: "LOGI-MXM3S-GR",
    description: "Logitech MX Master 3S Graphite",
    type: "OUT",
    quantity: 12,
    referenceId: "INV-44102",
    executedBy: "Sarah Admin",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuANshjKmqpsDSs5gBhBDEBqJG_aq4L-pTrnRhWqrd1jJTmJo5FIMa2y5R2scbSgfX9VQv0OX_D8KB1_W10TeYzAnzZ73GX0-Fegvk3R7SUvQSi4yUh5A9TsV-slyBCM0ENnHsKp4ebBAIpc3E8vOfhp5Lm5v0JZsv1n-nVAfxHBWg1r1oJnZoOE4-V_n5A_tsHjrFKFcC1D_yftTiyknr-TeLtT9M1Wf_DRa64plGIoQLJMVRBC5_DmRCEayd7LPr_QJa7f9ZP3iDBg"
  },
  {
    id: "mov-3",
    date: "Oct 24, 2023",
    time: "11:50 AM",
    sku: "DL-MON-P27-4K",
    description: 'Dell 27" 4K Professional Monitor',
    type: "ADJ",
    quantity: -2,
    referenceId: "ADJ-00451",
    executedBy: "Mike Warehouse",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDgudbRpsUhRoqfgWAUe94AlALgi9MedWvZmWmp3OpWB9gOiTvpvV1Q1E7CIj5XPRMnrJzvaGYcoyCxJYYCTaaeSX-BHYEEfk52-NWl2w6_wQmgCJo2T7A5UT51frGnBcQ5G1qVG4VI8EVbF4uFSvg-ewYGADLJZFPebi1NQZEP-wxB6pZJQ1tjPhXPtFp0NouDd7jzUyj64nAaFcLDdGe6YIq51_rRAyFTqhMBSPCQNa1WJtKRpIi9Oc4sr6c3qQprQp9an3kjV-H"
  },
  {
    id: "mov-4",
    date: "Oct 24, 2023",
    time: "09:12 AM",
    sku: "SM-SSD-980-2TB",
    description: "Samsung 980 Pro NVMe 2TB SSD",
    type: "IN",
    quantity: 200,
    referenceId: "PO-88289",
    executedBy: "John Doe",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDviZVD1pYtqLCQnSJAeHpk6AUNYcMwXpI0vC8a9Rx_mTwT0supG0cyyoaoi2JOTmws0D_aUgmnYZd3O2N4GVpagybsPQfuYFD7lLb-DTMS6layjeaDv-WBZu7p-zhjgz4RqDDqJprigQ0HVuyGH53ypWW3HP4qUwijeosYwP8kGRmGvCxqVfa49sMXwdJjZIfjlZE6q1t8xiiKK9HFCwZABfX9ijoa-btAsdUnHN-B79KUBzTtfrCPvne2BikS80e0YUj1PH-HA7Jt"
  },
  {
    id: "mov-5",
    date: "Oct 24, 2023",
    time: "08:45 AM",
    sku: "AP-AIRP-PRO2",
    description: "Apple AirPods Pro (2nd Gen)",
    type: "OUT",
    quantity: 30,
    referenceId: "INV-44100",
    executedBy: "Sarah Admin",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfiyaRBx9A-wMvwaz52vBN0g5XrDYKlOeTI8FqcfNTLdvBaAFSsm6K7NmvELi_ml0Ycd6hky8ZjFPYOVQGdM9WwKN9vCWrN7QFG0076FwefEMaV5B4LCHaiiQCvpeGicZr_5Yjk5QeueEMOXqSjiweOuDE3pEb56RRej4f4YrDH-qi63JHakiiNfW1hLbUS44jx7hM4d_xOkZOUZ3L3WbnZEc_JBhZa9CCsis1Sc_7GyayxxAsPOcmWujKU1PrODuBGyxuOYLIywRT"
  }
];

export const initialSuppliers: Supplier[] = [
  {
    name: "Sonic Components Ltd.",
    reliability: 98.4,
    leadTime: "14 Days",
    MOQ: "100 units",
    unitPrice: 145.0,
    status: "PRIMARY"
  },
  {
    name: "Global Audio Wholesalers",
    reliability: 87.8,
    leadTime: "21 Days",
    MOQ: "500 units",
    unitPrice: 138.5,
    status: "BACKUP"
  },
  {
    name: "Cisco Systems Inc.",
    reliability: 98.4,
    leadTime: "10 Days",
    MOQ: "10 units",
    unitPrice: 850.0,
    status: "PRIMARY"
  },
  {
    name: "Apple Business",
    reliability: 92.1,
    leadTime: "7 Days",
    MOQ: "5 units",
    unitPrice: 2800.0,
    status: "PRIMARY"
  },
  {
    name: "Dell Technologies",
    reliability: 87.8,
    leadTime: "14 Days",
    MOQ: "1 unit",
    unitPrice: 4200.0,
    status: "PRIMARY"
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    poId: "PO-2023-8841",
    supplierName: "Global Tech Solutions",
    date: "Oct 24, 2023",
    status: "Pending",
    total: 12450.0,
    initials: "GT"
  },
  {
    poId: "PO-2023-8839",
    supplierName: "North Star Logistics",
    date: "Oct 22, 2023",
    status: "Partial",
    total: 8200.0,
    initials: "NS"
  },
  {
    poId: "PO-2023-8835",
    supplierName: "Apex Parts & Spares",
    date: "Oct 20, 2023",
    status: "Fully Received",
    total: 45120.0,
    initials: "AP"
  },
  {
    poId: "PO-2023-8830",
    supplierName: "Zenith Manufacturing",
    date: "Oct 18, 2023",
    status: "Cancelled",
    total: 2100.0,
    initials: "ZN"
  }
];

export const initialCustomers: Customer[] = [
  { id: "cust-1", name: "Walk-in Customer", email: "walkin@sheeterp.com" },
  { id: "cust-2", name: "Sarah Johnson", email: "sarah.j@email.com", accountNo: "SAR-1002" },
  { id: "cust-3", name: "Mark Thompson", email: "m.thompson@corp.com", accountNo: "THO-3422" },
  { id: "cust-4", name: "Retail Plus Co.", email: "accounts@retailplus.com", accountNo: "RET-9902" }
];
