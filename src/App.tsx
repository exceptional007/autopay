import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash2,
  Download,
  TrendingUp,
  Calendar,
  MapPin,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Settings,
  Sparkles,
  Info,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  X,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  Globe,
  Navigation,
  Search,
  Filter,
  BarChart3,
  ListFilter,
  SlidersHorizontal,
  DollarSign,
  Clock,
  UserCheck
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  fetchExpenses,
  addExpense,
  deleteExpense,
  fetchUserSettings,
  saveUserSettings
} from "./dbService";
import { getFirebaseAuth, getOrCreateUserId } from "./firebase";
import { Expense } from "./types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authActionLoading, setAuthActionLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState<boolean>(false);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(2000);
  const [budgetInput, setBudgetInput] = useState<string>("2000");
  const [savingBudget, setSavingBudget] = useState<boolean>(false);
  const [defaultFare, setDefaultFare] = useState<string>("25");
  const [defaultRoute, setDefaultRoute] = useState<string>("College → Home");
  const [autoFillEnabled, setAutoFillEnabled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "analytics" | "portal">("dashboard");
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [amountInput, setAmountInput] = useState<string>("");
  const [routeInput, setRouteInput] = useState<string>("");
  const [searchRoute, setSearchRoute] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [dateInput, setDateInput] = useState<string>(getTodayString());
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const amountRef = useRef<HTMLInputElement>(null);
  const modalAmountRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);
  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setAuthLoading(false);
        if (firebaseUser) {
          setUserId(firebaseUser.uid);
          loadUserExpenses(firebaseUser.uid);
          loadUserSettings(firebaseUser.uid);
        } else {
          const guestId = getOrCreateUserId();
          setUserId(guestId);
          loadUserExpenses(guestId);
          loadUserSettings(guestId);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      setAuthLoading(false);
      const guestId = getOrCreateUserId();
      setUserId(guestId);
      loadUserExpenses(guestId);
      loadUserSettings(guestId);
    }
  }, []);
  useEffect(() => {
    if (activeTab === "dashboard" && !loadingExpenses && !authLoading && amountRef.current) {
      amountRef.current.focus();
    }
  }, [activeTab, loadingExpenses, authLoading, user]);

  useEffect(() => {
    if (isLogModalOpen) {
      if (autoFillEnabled) {
        setAmountInput(prev => prev || defaultFare);
        setRouteInput(prev => prev || defaultRoute);
      }
      if (modalAmountRef.current) {
        setTimeout(() => {
          modalAmountRef.current?.focus();
        }, 100);
      }
    }
  }, [isLogModalOpen, autoFillEnabled, defaultFare, defaultRoute]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const loadUserExpenses = async (uid: string) => {
    setLoadingExpenses(true);
    try {
      const fetched = await fetchExpenses(uid);
      setExpenses(fetched);
    } catch (err) {
      console.error("Error loading expenses:", err);
      showToast("Could not sync cloud data. Using local cache.", "error");
    } finally {
      setLoadingExpenses(false);
    }
  };

  const loadUserSettings = async (uid: string) => {
    try {
      const settings = await fetchUserSettings(uid);
      setMonthlyBudget(settings.monthlyBudget);
      setBudgetInput(settings.monthlyBudget.toString());
      setDefaultFare(settings.defaultFare ?? "25");
      setDefaultRoute(settings.defaultRoute ?? "College → Home");
      setAutoFillEnabled(settings.autoFillEnabled ?? false);

      if (settings.autoFillEnabled) {
        setAmountInput(prev => prev || (settings.defaultFare ?? "25"));
        setRouteInput(prev => prev || (settings.defaultRoute ?? "College → Home"));
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  const handleUpdateSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(budgetInput);
    if (isNaN(parsed) || parsed <= 0) {
      showToast("Please enter a valid budget amount", "error");
      return;
    }
    setSavingBudget(true);
    try {
      await saveUserSettings(userId, {
        userId,
        monthlyBudget: parsed,
        defaultFare,
        defaultRoute,
        autoFillEnabled
      });
      setMonthlyBudget(parsed);
      showToast(`Settings updated successfully`, "success");
    } catch (err) {
      showToast("Failed to save settings", "error");
    } finally {
      setSavingBudget(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!emailInput || !passwordInput) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setAuthActionLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (authTab === "signin") {
        await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        showToast("Signed in successfully!", "success");
      } else {
        await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        showToast("Account created successfully!", "success");
      }
      setEmailInput("");
      setPasswordInput("");
    } catch (err: any) {
      console.error("Authentication error:", err);
      let errMsg = "Authentication failed. Please try again.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "Email is already registered.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Invalid email address format.";
      }
      setAuthError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    setAuthActionLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      showToast("Signed in successfully!", "success");
    } catch (err: any) {
      setAuthError("Google sign-in failed. Please try again or use Email/Password.");
      showToast("Google login could not complete.", "error");
      setAuthActionLoading(false);
    }
  };


  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      showToast("Signed out successfully.", "info");
      setActiveTab("dashboard");
    } catch (err) {
      showToast("Error signing out", "error");
    }
  };
  const PRESET_ROUTES = [
    "Home to College",
    "College to Home",
    "Up-Down to College",
  ];

  const PRESET_AMOUNTS = [50, 100, 150, 200];

  const getDynamicRouteSuggestions = () => {
    const frequency: Record<string, number> = {};
    expenses.forEach(e => {
      if (e.route) {
        frequency[e.route] = (frequency[e.route] || 0) + 1;
      }
    });
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .filter(route => !PRESET_ROUTES.includes(route))
      .slice(0, 3);
  };
  const handleLogExpense = async (e: React.FormEvent, isModal: boolean = false) => {
    e.preventDefault();
    let finalAmount = 100;
    const currentInput = isModal ? amountInput : amountInput;
    if (amountInput.trim() !== "") {
      const parsed = parseFloat(amountInput);
      if (isNaN(parsed) || parsed <= 0) {
        showToast("Please enter a valid amount", "error");
        return;
      }
      finalAmount = parsed;
    }

    const finalRoute = routeInput.trim() || "Auto Ride";
    const finalDate = dateInput || getTodayString();

    try {
      const newExp = await addExpense(userId, finalAmount, finalRoute, finalDate);
      setExpenses(prev => [newExp, ...prev]);
      setAmountInput(autoFillEnabled ? defaultFare : "");
      setRouteInput(autoFillEnabled ? defaultRoute : "");
      setIsLogModalOpen(false);
      showToast(`Logged ₹${finalAmount} for "${finalRoute}"`, "success");

      if (!isModal && amountRef.current) {
        amountRef.current.focus();
      }
    } catch (err) {
      showToast("Failed to save entry", "error");
    }
  };

  const handleDeleteExpense = async (expenseId: string, amount: number) => {
    try {
      await deleteExpense(userId, expenseId);
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      showToast(`Deleted entry of ₹${amount}`, "info");
    } catch (err) {
      showToast("Failed to delete entry", "error");
    }
  };
  const getFilteredExpenses = () => {
    return expenses.filter(e => {
      if (searchRoute.trim() !== "") {
        const routeMatch = e.route.toLowerCase().includes(searchRoute.toLowerCase());
        if (!routeMatch) return false;
      }
      if (minAmount.trim() !== "") {
        if (e.amount < parseFloat(minAmount)) return false;
      }
      if (maxAmount.trim() !== "") {
        if (e.amount > parseFloat(maxAmount)) return false;
      }
      if (startDate.trim() !== "") {
        if (e.date < startDate) return false;
      }
      if (endDate.trim() !== "") {
        if (e.date > endDate) return false;
      }
      return true;
    });
  };

  const filteredExpenses = getFilteredExpenses();
  const getExpensesByMonth = (list: Expense[]) => {
    const grouped: Record<string, Expense[]> = {};
    list.forEach(e => {
      const dateParts = e.date.split("-");
      if (dateParts.length < 2) return;
      const year = dateParts[0];
      const monthIndex = parseInt(dateParts[1]) - 1;

      const monthName = new Date(parseInt(year), monthIndex).toLocaleString("default", {
        month: "long",
        year: "numeric"
      });

      if (!grouped[monthName]) {
        grouped[monthName] = [];
      }
      grouped[monthName].push(e);
    });
    return grouped;
  };

  const groupedExpenses = getExpensesByMonth(filteredExpenses);
  const activeMonthName = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const activeMonthExpenses = getExpensesByMonth(expenses)[activeMonthName] || [];
  const totalSpentActiveMonth = activeMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSpentOverall = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRidesCount = expenses.length;
  const activeMonthRidesCount = activeMonthExpenses.length;
  const averageFareActiveMonth = activeMonthRidesCount > 0 ? Math.round(totalSpentActiveMonth / activeMonthRidesCount) : 0;
  const budgetPercentage = Math.min(Math.round((totalSpentActiveMonth / monthlyBudget) * 100), 100);
  const budgetStatus = totalSpentActiveMonth > monthlyBudget ? "over" : totalSpentActiveMonth > monthlyBudget * 0.85 ? "warning" : "ok";

  const toggleMonth = (monthName: string) => {
    setCollapsedMonths(prev => ({ ...prev, [monthName]: !prev[monthName] }));
  };
  const getSpendingChartData = () => {
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push(d.toLocaleString("default", { month: "short", year: "numeric" }));
    }

    const allGrouped = getExpensesByMonth(expenses);
    const dataPoints = last6Months.map(mLabel => {
      const matchingKey = Object.keys(allGrouped).find(key => key.toLowerCase().includes(mLabel.split(" ")[0].toLowerCase()));
      const sum = matchingKey ? allGrouped[matchingKey].reduce((s, exp) => s + exp.amount, 0) : 0;
      return { month: mLabel.split(" ")[0], amount: sum };
    });

    const maxAmt = Math.max(...dataPoints.map(d => d.amount), 500);
    return { dataPoints, maxAmt };
  };

  const getRouteChartData = () => {
    const routeSums: Record<string, number> = {};
    expenses.forEach(e => {
      const routeName = e.route || "General Commute";
      routeSums[routeName] = (routeSums[routeName] || 0) + e.amount;
    });

    return Object.entries(routeSums)
      .map(([route, total]) => ({ route, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const { dataPoints: trendData, maxAmt: trendMax } = getSpendingChartData();
  const topRouteData = getRouteChartData();
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      doc.setFillColor(11, 15, 25);
      doc.rect(0, 0, pageWidth, 42, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.text("AUTO TRAVEL EXPENSE REPORT", 14, 20);
      doc.setTextColor(16, 185, 129);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text("PREMIUM DAILY AUTO EXPENSE TRACKER FOR STUDENTS", 14, 27);
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 18, { align: "right" });
      doc.text(`User ID: ${user ? user.email : "Guest Session"}`, pageWidth - 14, 25, { align: "right" });
      doc.text(`Total Records: ${expenses.length}`, pageWidth - 14, 32, { align: "right" });
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.text("Travel Financial Summary", 14, 52);
      const boxW = (pageWidth - 28 - 6) / 2;
      const boxH = 22;
      const startY = 57;
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY, boxW, boxH, "FD");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont("Helvetica", "bold");
      doc.text(`SPENT IN ${activeMonthName.toUpperCase()}`, 18, startY + 6);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text(`Rs. ${totalSpentActiveMonth.toLocaleString()}`, 18, startY + 15);
      doc.rect(14 + boxW + 6, startY, boxW, boxH, "FD");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("TOTAL SPENT (ALL TIME)", 14 + boxW + 10, startY + 6);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(`Rs. ${totalSpentOverall.toLocaleString()}`, 14 + boxW + 10, startY + 15);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.text("Chronological Auto Travel Logs", 14, 91);
      const tableRows = (filteredExpenses.length > 0 ? filteredExpenses : expenses).map((e, index) => {
        const dateObj = new Date(e.date);
        const formattedDate = isNaN(dateObj.getTime())
          ? e.date
          : dateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });

        return [
          index + 1,
          formattedDate,
          e.route || "General Auto Commute",
          `Rs. ${e.amount.toLocaleString()}`
        ];
      });
      autoTable(doc, {
        startY: 96,
        head: [['S. No.', 'Date', 'Route / Travel Note', 'Fare Amount']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [11, 15, 25],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          valign: 'middle'
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data: any) => {
          const pageNum = doc.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.setFont("Helvetica", "normal");
          doc.text(
            "AutoPay Daily Auto Expense Tracker — Powered by Secure Student Cloud Sync",
            14,
            pageHeight - 10
          );
          doc.text(
            `Page ${pageNum}`,
            pageWidth - 14,
            pageHeight - 10,
            { align: "right" }
          );
        }
      });
      doc.save(`AutoPay_Travel_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast("PDF report exported successfully!", "success");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("Failed to generate PDF. Try again.", "error");
    }
  };

  const handleClearFilters = () => {
    setSearchRoute("");
    setMinAmount("");
    setMaxAmount("");
    setStartDate("");
    setEndDate("");
    showToast("Filters cleared", "info");
  };

  return (
    <div id="app-container" className="min-h-screen bg-[#FAFAFA] text-[#111827] dark:bg-[#0B0F19] dark:text-white flex flex-col antialiased transition-colors duration-300">
      <AnimatePresence>
        {toast && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full border shadow-lg backdrop-blur-md ${toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
              : toast.type === "error"
                ? "bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200"
                : "bg-teal-50 dark:bg-teal-950/90 border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-200"
              }`}
          >
            {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {toast.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-500" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-teal-500" />}
            <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <nav id="main-nav" className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1E293B] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center shadow-md shadow-[#10B981]/20 shrink-0 cursor-pointer"
              >
                <Navigation className="w-5 h-5 text-white transform rotate-45" />
              </motion.div>
              <div>
                <span className="text-base font-bold font-display tracking-tight flex items-center gap-1.5 text-[#111827] dark:text-white">
                  AutoPay <span className="text-[10px] bg-[#10B981] text-white px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">STUDENT</span>
                </span>
                <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] block font-medium -mt-0.5">Commute Expense Ledger</span>
              </div>
            </div>
            {user && (
              <div className="hidden md:flex items-center gap-1 bg-[#FAFAFA] dark:bg-[#121826]/60 p-1 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B]">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "dashboard"
                    ? "bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm"
                    : "text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white"
                    }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "history"
                    ? "bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm"
                    : "text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white"
                    }`}
                >
                  Logs & History
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "analytics"
                    ? "bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm"
                    : "text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white"
                    }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab("portal")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "portal"
                    ? "bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm"
                    : "text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white"
                    }`}
                >
                  Portal Settings
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-all"
                title="Switch Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </motion.button>

              {user && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-rose-500 hover:text-white hover:bg-rose-500 dark:hover:bg-rose-600/30 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              )}
            </div>

          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 pb-24 md:pb-12">

        {authLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center py-32 text-[#6B7280] dark:text-[#94A3B8] gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-[#10B981]" />
            <p className="text-xs font-semibold tracking-wider font-mono">ESTABLISHING ENCRYPTED STUDENT CHANNEL...</p>
          </div>
        ) : !user ? (
          <div className="max-w-md w-full mx-auto py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white dark:bg-[#121826] p-8 border border-[#E5E7EB] dark:border-[#1E293B] shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg mx-auto mb-4">
                  <Navigation className="w-6 h-6 text-white transform rotate-45" />
                </div>
                <h2 className="text-2xl font-bold font-display text-[#111827] dark:text-white tracking-tight">Access Commuter Portal</h2>
                <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-2 leading-relaxed">
                  Daily auto fares tracked accurately. Synchronized securely in cloud partition or run entirely locally.
                </p>
              </div>
              <div className="flex rounded-xl bg-[#FAFAFA] dark:bg-[#0B0F19] p-1 mb-6 border border-[#E5E7EB] dark:border-[#1E293B]">
                <button
                  onClick={() => setAuthTab("signin")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authTab === "signin"
                    ? "bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm"
                    : "text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white"
                    }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab("signup")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authTab === "signup"
                    ? "bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-sm"
                    : "text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white"
                    }`}
                >
                  Register
                </button>
              </div>
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] leading-snug flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">College Email</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. yourname@student.edu"
                      required
                      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm border bg-white dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981] dark:focus:border-[#10B981] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm border bg-white dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981] dark:focus:border-[#10B981] transition-all"
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={authActionLoading}
                  className="w-full bg-[#10B981] hover:bg-[#059669] disabled:bg-[#6B7280] text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-md shadow-[#10B981]/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authActionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : authTab === "signin" ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In to Account
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Register Student ID
                    </>
                  )}
                </motion.button>
              </form>
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E7EB] dark:border-[#1E293B]"></div>
                </div>
                <span className="relative px-3 text-[9px] uppercase font-bold tracking-widest bg-white dark:bg-[#121826] text-[#6B7280] dark:text-[#94A3B8] font-mono">
                  Federated Sync
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogleAuth}
                disabled={authActionLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-[#111827] dark:text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
              >
                <Globe className="w-4 h-4 text-[#10B981]" />
                Continue with Google
              </motion.button>


            </motion.div>
          </div>
        ) : (
          <>
            <div className="md:hidden flex items-center justify-between bg-white dark:bg-[#121826] px-4 py-3 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#111827] dark:text-white">
                  {activeTab === "dashboard" ? "Dashboard" : activeTab === "history" ? "All Logs" : activeTab === "analytics" ? "Charts & Stats" : "Portal Settings"}
                </span>
              </div>
              <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full font-mono font-bold border border-[#10B981]/20">
                {expenses.length} Commutes
              </span>
            </div>
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <motion.div
                      whileHover={{ y: -3 }}
                      className="rounded-2xl p-5 bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm relative overflow-hidden transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">This Month Spent</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-[#10B981]">
                          <Wallet className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-[#6B7280] dark:text-[#94A3B8] font-mono">₹</span>
                        <span className="text-2xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                          {totalSpentActiveMonth.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] text-[#6B7280] dark:text-[#94A3B8] mb-1 font-mono font-semibold">
                          <span>Budget Progress</span>
                          <span>{budgetPercentage}%</span>
                        </div>
                        <div className="w-full bg-[#FAFAFA] dark:bg-[#0B0F19] rounded-full h-1.5 overflow-hidden border border-[#E5E7EB] dark:border-[#1E293B]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${budgetPercentage}%` }}
                            className={`h-full rounded-full ${budgetStatus === "over"
                              ? "bg-rose-500"
                              : budgetStatus === "warning"
                                ? "bg-amber-500"
                                : "bg-[#10B981]"
                              }`}
                          />
                        </div>
                      </div>
                    </motion.div>

                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#121826] p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/50">
                        <div className="w-6 h-6 rounded-md bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold tracking-tight text-[#111827] dark:text-white">Quick Log Daily Ride</h3>
                      </div>

                      <form onSubmit={(e) => handleLogExpense(e, false)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Fare Amount</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#6B7280] dark:text-[#94A3B8]">₹</span>
                              <input
                                type="number"
                                ref={amountRef}
                                value={amountInput}
                                onChange={(e) => setAmountInput(e.target.value)}
                                placeholder="100"
                                className="w-full rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold font-mono border bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981]"
                              />
                            </div>
                            <span className="text-[9px] text-[#6B7280] dark:text-[#94A3B8] block leading-tight">Defaults to ₹100 if empty</span>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Route / COMMUTE NOTE</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]">
                                <MapPin className="w-4 h-4" />
                              </span>
                              <input
                                type="text"
                                value={routeInput}
                                onChange={(e) => setRouteInput(e.target.value)}
                                placeholder="e.g. Home to College"
                                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold border bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981]"
                              />
                            </div>
                            <span className="text-[9px] text-[#6B7280] dark:text-[#94A3B8] block leading-tight">Defaults to &quot;Auto Ride&quot;</span>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Commute Date</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]">
                                <Calendar className="w-4 h-4" />
                              </span>
                              <input
                                type="date"
                                value={dateInput}
                                onChange={(e) => setDateInput(e.target.value)}
                                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold border bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981] [color-scheme:light] dark:[color-scheme:dark]"
                              />
                            </div>
                          </div>

                        </div>
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-widest font-mono block">Preset Amounts:</span>
                          <div className="flex flex-wrap gap-2">
                            {PRESET_AMOUNTS.map(amt => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setAmountInput(amt.toString())}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${amountInput === amt.toString()
                                  ? "bg-[#10B981] border-[#10B981] text-white shadow-sm"
                                  : "bg-white dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:border-[#10B981]"
                                  }`}
                              >
                                ₹{amt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-widest font-mono block">Standard College Routes:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_ROUTES.map(rOpt => (
                              <button
                                key={rOpt}
                                type="button"
                                onClick={() => setRouteInput(rOpt)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${routeInput === rOpt
                                  ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981] font-bold"
                                  : "bg-white dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:border-[#10B981]"
                                  }`}
                              >
                                {rOpt}
                              </button>
                            ))}
                            {getDynamicRouteSuggestions().map(rOpt => (
                              <button
                                key={rOpt}
                                type="button"
                                onClick={() => setRouteInput(rOpt)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border border-dashed ${routeInput === rOpt
                                  ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981] font-bold"
                                  : "bg-white dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:border-[#10B981]"
                                  }`}
                              >
                                ✨ {rOpt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#10B981]/10"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5px]" />
                            Log Travel Expense
                          </motion.button>
                        </div>

                      </form>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-[#121826] p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#111827] dark:text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                          Recent Commutes
                        </h3>
                        <button
                          onClick={() => setActiveTab("history")}
                          className="text-[10px] font-bold text-[#10B981] hover:underline"
                        >
                          View All
                        </button>
                      </div>

                      {expenses.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center py-10 text-center">
                          <Info className="w-8 h-8 text-[#6B7280] dark:text-[#94A3B8] mb-2 opacity-55" />
                          <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] font-semibold">No recent logs</p>
                        </div>
                      ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1">
                          {expenses.slice(0, 4).map(exp => (
                            <div
                              key={exp.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAFA] dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B]"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="block text-xs font-bold text-[#111827] dark:text-white truncate">
                                  {exp.route || "Commute"}
                                </span>
                                <span className="block text-[9px] text-[#6B7280] dark:text-[#94A3B8] font-mono">
                                  {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                              <span className="text-xs font-extrabold text-[#111827] dark:text-white font-mono shrink-0">
                                ₹{exp.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
              {activeTab === "history" && (
                <motion.div
                  key="history-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold font-display tracking-tight text-[#111827] dark:text-white">Travel History Ledgers</h2>
                      <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1">Review, filter, query, or download your verified auto commute reports.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${isFilterPanelOpen
                          ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]"
                          : "bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:border-[#10B981]"
                          }`}
                      >
                        <Filter className="w-4 h-4" />
                        Query Filters
                        {(searchRoute || minAmount || maxAmount || startDate || endDate) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        )}
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportPDF}
                        disabled={expenses.length === 0}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white hover:border-[#10B981] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        Export PDF Report
                      </motion.button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isFilterPanelOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl bg-white dark:bg-[#121826] p-5 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
                            <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#111827] dark:text-white flex items-center gap-1">
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              Configure Travel Query Filters
                            </span>
                            <button
                              onClick={handleClearFilters}
                              className="text-[10px] font-bold text-rose-500 hover:underline"
                            >
                              Clear All Filters
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Route Search</label>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280] dark:text-[#94A3B8]" />
                                <input
                                  type="text"
                                  value={searchRoute}
                                  onChange={(e) => setSearchRoute(e.target.value)}
                                  placeholder="e.g. College"
                                  className="w-full rounded-lg pl-8 pr-2 py-1.5 text-xs bg-[#FAFAFA] dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981]"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Min Fare (₹)</label>
                              <input
                                type="number"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                placeholder="Min"
                                className="w-full rounded-lg px-2.5 py-1.5 text-xs bg-[#FAFAFA] dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981] font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Max Fare (₹)</label>
                              <input
                                type="number"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                placeholder="Max"
                                className="w-full rounded-lg px-2.5 py-1.5 text-xs bg-[#FAFAFA] dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981] font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">From Date</label>
                              <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-lg px-2 py-1.5 text-xs bg-[#FAFAFA] dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">To Date</label>
                              <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-lg px-2 py-1.5 text-xs bg-[#FAFAFA] dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                              />
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {filteredExpenses.length === 0 ? (
                    <div className="rounded-2xl bg-white dark:bg-[#121826] p-16 text-center border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mb-1">
                        <Info className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#111827] dark:text-white">No travel logs found</h4>
                      <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] max-w-xs leading-relaxed">
                        No commutes match your exact filters. Adjust your queries or log a new travel record to start tracking.
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          handleClearFilters();
                          setIsLogModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold rounded-lg mt-2 cursor-pointer shadow-sm"
                      >
                        Reset & Create Commute
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedExpenses).map(([monthName, monthExpenses]) => {
                        const isCollapsed = collapsedMonths[monthName] || false;
                        const monthlyTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

                        return (
                          <div
                            key={monthName}
                            id={`month-group-${monthName.replace(/\s+/g, "-")}`}
                            className="rounded-2xl bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] overflow-hidden shadow-sm transition-all"
                          >
                            <button
                              onClick={() => toggleMonth(monthName)}
                              className="w-full flex items-center justify-between px-5 py-4 transition-all hover:bg-slate-50 dark:hover:bg-[#1C2538]/30 border-b border-[#E5E7EB] dark:border-[#1E293B]"
                            >
                              <div className="flex items-center gap-2.5">
                                {isCollapsed ? (
                                  <ChevronRight className="w-4 h-4 text-[#6B7280] dark:text-[#94A3B8]" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-[#6B7280] dark:text-[#94A3B8]" />
                                )}
                                <span className="font-bold text-sm text-[#111827] dark:text-white font-display">{monthName}</span>
                                <span className="text-[10px] bg-[#FAFAFA] dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] px-2 py-0.5 rounded-full font-mono font-bold">
                                  {monthExpenses.length} Commutes
                                </span>
                              </div>

                              <div className="flex items-baseline gap-1">
                                <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] font-mono font-bold uppercase">Total Spend:</span>
                                <span className="text-sm font-extrabold text-[#10B981] font-mono">
                                  ₹{monthlyTotal.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </button>
                            <AnimatePresence initial={false}>
                              {!isCollapsed && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
                                    {monthExpenses.map((expense) => {
                                      const dateObj = new Date(expense.date);
                                      const formattedDateDay = isNaN(dateObj.getTime())
                                        ? expense.date
                                        : dateObj.toLocaleDateString("en-IN", { weekday: "short" });
                                      const formattedDateNum = isNaN(dateObj.getTime())
                                        ? ""
                                        : dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

                                      return (
                                        <div
                                          key={expense.id}
                                          id={`expense-row-${expense.id}`}
                                          className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/20 transition-all group"
                                        >
                                          <div className="flex items-center gap-4 min-w-0 pr-4">
                                            <div className="border rounded-xl p-2 text-center shrink-0 min-w-[54px] bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B]">
                                              <span className="block text-[9px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase leading-none font-mono">
                                                {formattedDateDay}
                                              </span>
                                              <span className="block text-xs text-[#10B981] font-extrabold mt-1 leading-none font-mono">
                                                {formattedDateNum}
                                              </span>
                                            </div>
                                            <div className="min-w-0">
                                              <span className="text-xs font-bold text-[#111827] dark:text-white block truncate leading-snug">
                                                {expense.route || "Auto Ride Commute"}
                                              </span>
                                              <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] block font-mono mt-0.5">
                                                Logged at {new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3.5 shrink-0">
                                            <span className="text-sm font-extrabold text-[#111827] dark:text-white font-mono">
                                              ₹{expense.amount.toLocaleString("en-IN")}
                                            </span>

                                            <motion.button
                                              whileHover={{ scale: 1.1, color: "#EF4444" }}
                                              whileTap={{ scale: 0.9 }}
                                              id={`delete-btn-${expense.id}`}
                                              onClick={() => handleDeleteExpense(expense.id, expense.amount)}
                                              className="p-2 text-[#6B7280] dark:text-[#94A3B8] hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                                              title="Delete Commute Entry"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === "analytics" && (
                <motion.div
                  key="analytics-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold font-display tracking-tight text-[#111827] dark:text-white">Commuter Financial Intelligence</h2>
                    <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1">Visualize fare patterns, top routes, and monitor daily transit spending limits.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-white dark:bg-[#121826] p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/50 mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#111827] dark:text-white flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                          6-Month Commuter Spend Trend
                        </span>
                        <span className="text-[9px] bg-emerald-500/10 text-[#10B981] px-2 py-0.5 rounded-full font-mono font-bold border border-[#10B981]/10">
                          Interactive Curve
                        </span>
                      </div>
                      <div className="relative w-full h-56 pt-4">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 160">
                          <line x1="0" y1="20" x2="400" y2="20" stroke="currentColor" className="text-slate-100 dark:text-slate-800/30" strokeDasharray="3 3" />
                          <line x1="0" y1="70" x2="400" y2="70" stroke="currentColor" className="text-slate-100 dark:text-slate-800/30" strokeDasharray="3 3" />
                          <line x1="0" y1="120" x2="400" y2="120" stroke="currentColor" className="text-slate-100 dark:text-slate-800/30" strokeDasharray="3 3" strokeWidth="1" />
                          {(() => {
                            const padding = 35;
                            const spacing = (400 - padding * 2) / 5;
                            const points = trendData.map((d, index) => {
                              const x = padding + index * spacing;
                              const y = 120 - ((d.amount / (trendMax || 1)) * 100);
                              return { x, y, label: d.month, amount: d.amount };
                            });

                            const dPath = points.reduce((acc, p, index) => {
                              return acc + `${index === 0 ? "M" : "L"} ${p.x} ${p.y}`;
                            }, "");

                            const dArea = points.length > 0
                              ? `${dPath} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`
                              : "";

                            return (
                              <>
                                {dArea && <path d={dArea} fill="url(#chart-gradient)" opacity="0.15" className="text-[#10B981]" />}
                                <defs>
                                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="100%" stopColor="transparent" />
                                  </linearGradient>
                                </defs>
                                {dPath && <path d={dPath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                                {points.map((p, i) => (
                                  <g key={i} className="group/node">
                                    <circle
                                      cx={p.x}
                                      cy={p.y}
                                      r="4"
                                      fill="#10B981"
                                      stroke={isDarkMode ? "#121826" : "white"}
                                      strokeWidth="2"
                                      className="transition-all duration-200 cursor-pointer hover:r-6"
                                    />
                                    <text
                                      x={p.x}
                                      y={p.y - 10}
                                      textAnchor="middle"
                                      className="text-[9px] font-mono font-bold fill-[#111827] dark:fill-white opacity-0 group-hover/node:opacity-100 transition-opacity bg-slate-900 duration-200"
                                    >
                                      ₹{p.amount}
                                    </text>
                                    <text
                                      x={p.x}
                                      y="140"
                                      textAnchor="middle"
                                      className="text-[9px] font-semibold font-mono fill-[#6B7280] dark:fill-[#94A3B8]"
                                    >
                                      {p.label}
                                    </text>
                                  </g>
                                ))}
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] font-medium">Hover over nodes to see month aggregate values</p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-[#121826] p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/50 mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#111827] dark:text-white flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-[#10B981]" />
                          Top Commuted Route Budgets
                        </span>
                        <span className="text-[9px] bg-teal-500/10 text-teal-500 px-2 py-0.5 rounded-full font-mono font-bold border border-teal-500/10">
                          Route Aggregate
                        </span>
                      </div>

                      {topRouteData.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-center">
                          <Info className="w-8 h-8 text-[#6B7280] dark:text-[#94A3B8] mb-1.5 opacity-60" />
                          <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] font-semibold">No data logged yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4 py-2">
                          {(() => {
                            const maxRouteFare = Math.max(...topRouteData.map(r => r.total), 1);
                            return topRouteData.map((item, idx) => {
                              const pct = Math.round((item.total / maxRouteFare) * 100);
                              return (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="truncate pr-3 text-[#111827] dark:text-white">{item.route}</span>
                                    <span className="font-mono font-bold text-[#10B981] shrink-0">₹{item.total}</span>
                                  </div>
                                  <div className="w-full bg-[#FAFAFA] dark:bg-[#0B0F19] rounded-full h-2 border border-[#E5E7EB] dark:border-[#1E293B] overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      className="h-full rounded-full bg-[#10B981]"
                                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    />
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>

                  </div>
                  <div className="rounded-2xl bg-white dark:bg-[#121826] p-5 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0 border border-amber-500/15">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#111827] dark:text-white">Daily Commute Savings Advisory</h4>
                        <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1 max-w-xl leading-relaxed">
                          Your active monthly spend of ₹{totalSpentActiveMonth} is at {budgetPercentage}% of your set daily auto limit. Consolidate travels or use shared campus auto rides to prevent monthly overruns.
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab("portal")}
                      className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] hover:border-[#10B981] text-[#6B7280] dark:text-[#94A3B8] hover:text-white bg-slate-50 dark:bg-[#1E293B]/20 text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Configure Monthly Budget
                    </motion.button>
                  </div>
                </motion.div>
              )}
              {activeTab === "portal" && (
                <motion.div
                  key="portal-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-white dark:bg-[#121826] p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/50 mb-5">
                        <div className="w-6 h-6 rounded-md bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold tracking-tight text-[#111827] dark:text-white">Commuter Identity</h3>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#10B981] to-[#34D399] flex items-center justify-center text-white text-lg font-bold">
                          {user.email ? user.email.slice(0, 2).toUpperCase() : "G"}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-[#111827] dark:text-white">{user.email || "Local Guest Sandbox"}</h4>
                          <span className="text-[10px] bg-emerald-500/10 text-[#10B981] px-2 py-0.5 rounded-full font-mono font-bold border border-[#10B981]/10 inline-block mt-1">
                            Student Status: Verified Commuter
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3 bg-[#FAFAFA] dark:bg-[#0B0F19] p-4 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] font-mono text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                        <div className="flex items-center justify-between">
                          <span>User Partition UID:</span>
                          <span className="font-bold text-[#111827] dark:text-white">{user.uid.slice(0, 10)}...</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cloud Synchronization:</span>
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            ACTIVE
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Total Recorded Travels:</span>
                          <span className="font-bold text-[#111827] dark:text-white">{expenses.length} Fares</span>
                        </div>
                      </div>

                      {user.email === "Guest Commuter Space" && (
                        <div className="mt-5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            You are logged in under an anonymous local guest partition. To prevent loss of commuter ledgers, create a free registered Student account above.
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-[#121826] p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/50 mb-5">
                        <div className="w-6 h-6 rounded-md bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                          <Settings className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold tracking-tight text-[#111827] dark:text-white">Commuter Preferences</h3>
                      </div>

                      <form onSubmit={handleUpdateSettings} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Set Monthly Commute Budget (₹)</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-[#6B7280] dark:text-[#94A3B8] text-xs">₹</span>
                            <input
                              type="number"
                              value={budgetInput}
                              onChange={(e) => setBudgetInput(e.target.value)}
                              placeholder="2000"
                              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold font-mono border bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981]"
                            />
                          </div>
                          <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8] block leading-relaxed mt-1">
                            Set your maximum monthly travel allowance. We will compute active status progress on the main dashboard cards.
                          </span>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={savingBudget}
                            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#10B981]/10"
                          >
                            {savingBudget ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Save Budget Settings
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-[#121826] p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm mt-6">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/50 mb-5">
                        <div className="w-6 h-6 rounded-md bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                          <Settings className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold tracking-tight text-[#111827] dark:text-white">Expense Defaults</h3>
                      </div>

                      <form onSubmit={handleUpdateSettings} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Default Fare (₹)</label>
                          <input
                            type="text"
                            value={defaultFare}
                            onChange={(e) => setDefaultFare(e.target.value)}
                            placeholder="25"
                            className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold font-mono border bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981]"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Default Route / Travel Note</label>
                          <input
                            type="text"
                            value={defaultRoute}
                            onChange={(e) => setDefaultRoute(e.target.value)}
                            placeholder="College → Home"
                            className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold border bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981]"
                          />
                        </div>

                        <div 
                          onClick={() => setAutoFillEnabled(!autoFillEnabled)}
                          className="flex items-center justify-between mt-5 cursor-pointer group"
                        >
                          <span className="text-xs font-semibold text-[#111827] dark:text-white transition-colors">Auto-fill when adding expense</span>
                          <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${autoFillEnabled ? 'bg-[#10B981]' : 'bg-gray-200 dark:bg-slate-700'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${autoFillEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                        </div>
                        
                        <div className="pt-2 flex justify-end">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={savingBudget}
                            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#10B981]/10"
                          >
                            {savingBudget ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Save Defaults
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>
                    </div>


                  </div>
                </motion.div>
              )}

            </AnimatePresence>
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#121826] border-t border-[#E5E7EB] dark:border-[#1E293B] px-4 py-2 z-40 shadow-xl flex items-center justify-around transition-colors">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === "dashboard" ? "text-[#10B981] font-bold" : "text-[#6B7280] dark:text-[#94A3B8]"
                  }`}
              >
                <Wallet className="w-4 h-4" />
                <span className="text-[9px] font-semibold tracking-wider uppercase">Dash</span>
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === "history" ? "text-[#10B981] font-bold" : "text-[#6B7280] dark:text-[#94A3B8]"
                  }`}
              >
                <ListFilter className="w-4 h-4" />
                <span className="text-[9px] font-semibold tracking-wider uppercase">Logs</span>
              </button>
              <div className="relative -top-5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLogModalOpen(true)}
                  className="w-12 h-12 rounded-full bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center shadow-lg shadow-[#10B981]/30 cursor-pointer border border-[#E5E7EB] dark:border-[#1E293B]"
                >
                  <Plus className="w-6 h-6 stroke-[3px]" />
                </motion.button>
              </div>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === "analytics" ? "text-[#10B981] font-bold" : "text-[#6B7280] dark:text-[#94A3B8]"
                  }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-[9px] font-semibold tracking-wider uppercase">Stats</span>
              </button>

              <button
                onClick={() => setActiveTab("portal")}
                className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === "portal" ? "text-[#10B981] font-bold" : "text-[#6B7280] dark:text-[#94A3B8]"
                  }`}
              >
                <UserIcon className="w-4 h-4" />
                <span className="text-[9px] font-semibold tracking-wider uppercase">Portal</span>
              </button>
            </div>
            <AnimatePresence>
              {isLogModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                    className="w-full max-w-md bg-white dark:bg-[#121826] rounded-t-3xl border-t border-[#E5E7EB] dark:border-[#1E293B] p-6 shadow-2xl relative"
                  >
                    <div className="w-12 h-1 bg-[#E5E7EB] dark:bg-[#1E293B] rounded-full mx-auto mb-4"></div>

                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                      <span className="text-sm font-bold uppercase tracking-wider font-mono text-[#111827] dark:text-white flex items-center gap-1">
                        <Navigation className="w-4 h-4 text-[#10B981] transform rotate-45" />
                        Log Commute Ride
                      </span>
                      <button
                        onClick={() => setIsLogModalOpen(false)}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#1E293B] text-[#6B7280] dark:text-[#94A3B8] transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={(e) => handleLogExpense(e, true)} className="space-y-4 pb-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Fare Amount</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#6B7280] dark:text-[#94A3B8]">₹</span>
                          <input
                            type="number"
                            ref={modalAmountRef}
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            placeholder="100"
                            className="w-full rounded-xl pl-8 pr-3 py-2.5 text-sm font-semibold font-mono border bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981]"
                          />
                        </div>
                        <span className="text-[9px] text-[#6B7280] dark:text-[#94A3B8] block">Defaults to ₹100 if empty</span>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Route Name</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]">
                            <MapPin className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            value={routeInput}
                            onChange={(e) => setRouteInput(e.target.value)}
                            placeholder="e.g. Home to College"
                            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold border bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider font-mono">Commute Date</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]">
                            <Calendar className="w-4 h-4" />
                          </span>
                          <input
                            type="date"
                            value={dateInput}
                            onChange={(e) => setDateInput(e.target.value)}
                            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold border bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#111827] dark:text-white focus:outline-none focus:border-[#10B981] [color-scheme:light] dark:[color-scheme:dark]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[9px] font-bold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-widest font-mono block">Select Fare:</span>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_AMOUNTS.map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setAmountInput(amt.toString())}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${amountInput === amt.toString()
                                ? "bg-[#10B981] border-[#10B981] text-white"
                                : "bg-[#FAFAFA] dark:bg-[#0B0F19] border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#94A3B8]"
                                }`}
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#10B981]/10"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5px]" />
                        Log Commute Ride
                      </motion.button>

                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </>
        )}
      </main>
      <footer id="main-footer" className="mt-auto py-6 border-t border-[#E5E7EB] dark:border-[#1E293B] bg-white dark:bg-[#0B0F19] hidden md:block transition-all">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
            AutoPay Commuter - Premium student utility.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-[10px] text-[#6B7280] dark:text-[#94A3B8]">Synced securely to your Google account</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
