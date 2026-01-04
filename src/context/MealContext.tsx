import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, DailyMeal, Expense, ExtraExpense, Deposit, MaidPayment, ShopTransaction, MemberSummary } from '@/types';

const STORAGE_KEY = 'mess-manager-data';

interface StoredData {
  members: Member[];
  meals: DailyMeal[];
  expenses: Expense[];
  extraExpenses: ExtraExpense[];
  deposits: Deposit[];
  maidPayments: MaidPayment[];
  shopTransactions: ShopTransaction[];
}

interface MealContextType {
  members: Member[];
  meals: DailyMeal[];
  expenses: Expense[];
  extraExpenses: ExtraExpense[];
  deposits: Deposit[];
  maidPayments: MaidPayment[];
  shopTransactions: ShopTransaction[];
  addMember: (name: string) => void;
  removeMember: (id: string) => void;
  toggleMemberStatus: (id: string) => void;
  updateMeal: (date: string, memberId: string, type: 'lunch' | 'dinner', value: boolean) => void;
  updateMealCount: (date: string, memberId: string, type: 'lunch' | 'dinner', count: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  addExtraExpense: (expense: Omit<ExtraExpense, 'id'>) => void;
  removeExtraExpense: (id: string) => void;
  addDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  removeDeposit: (id: string) => void;
  addMaidPayment: (payment: Omit<MaidPayment, 'id'>) => void;
  removeMaidPayment: (id: string) => void;
  addShopTransaction: (transaction: Omit<ShopTransaction, 'id'>) => void;
  removeShopTransaction: (id: string) => void;
  getShopBalance: () => { totalPurchase: number; totalPayment: number; balance: number };
  getMealsForDate: (date: string) => DailyMeal[];
  getTodayStats: () => { lunch: number; dinner: number; total: number };
  getMonthlyStats: () => { totalMeals: number; totalExpenses: number; totalExtraExpenses: number; totalDeposits: number; totalMaidPayments: number; mealRate: number };
  getMemberSummaries: () => MemberSummary[];
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  clearAllData: () => void;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

const defaultMembers: Member[] = [
  { id: '1', name: 'বাধন আহমেদ', isActive: true },
  { id: '2', name: 'করিম হোসেন', isActive: true },
  { id: '3', name: 'জামাল আহমেদ', isActive: true },
  { id: '4', name: 'সাইফুল ইসলাম', isActive: true },
  { id: '5', name: 'মাহমুদ হাসান', isActive: true },
  { id: '6', name: 'আব্দুল্লাহ আল মামুন', isActive: true },
  { id: '7', name: 'তানভীর রহমান', isActive: true },
  { id: '8', name: 'শাহরিয়ার কবির', isActive: true },
];

const loadFromStorage = (): StoredData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return null;
};

const saveToStorage = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export function MealProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [extraExpenses, setExtraExpenses] = useState<ExtraExpense[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [maidPayments, setMaidPayments] = useState<MaidPayment[]>([]);
  const [shopTransactions, setShopTransactions] = useState<ShopTransaction[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setMembers(stored.members?.length > 0 ? stored.members : defaultMembers);
      setMeals(stored.meals || []);
      setExpenses(stored.expenses || []);
      setExtraExpenses(stored.extraExpenses || []);
      setDeposits(stored.deposits || []);
      setMaidPayments(stored.maidPayments || []);
      setShopTransactions(stored.shopTransactions || []);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage({ members, meals, expenses, extraExpenses, deposits, maidPayments, shopTransactions });
    }
  }, [members, meals, expenses, extraExpenses, deposits, maidPayments, shopTransactions, isLoaded]);

  const addMember = (name: string) => {
    const newMember: Member = {
      id: Date.now().toString(),
      name,
      isActive: true,
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const toggleMemberStatus = (id: string) => {
    setMembers(members.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const updateMeal = (date: string, memberId: string, type: 'lunch' | 'dinner', value: boolean) => {
    const existingIndex = meals.findIndex(m => m.date === date && m.memberId === memberId);
    
    if (existingIndex >= 0) {
      const updated = [...meals];
      updated[existingIndex] = {
        ...updated[existingIndex],
        [type]: value,
      };
      setMeals(updated);
    } else {
      const newMeal: DailyMeal = {
        date,
        memberId,
        lunch: type === 'lunch' ? value : false,
        dinner: type === 'dinner' ? value : false,
      };
      setMeals([...meals, newMeal]);
    }
  };

  const updateMealCount = (date: string, memberId: string, type: 'lunch' | 'dinner', count: number) => {
    const existingIndex = meals.findIndex(m => m.date === date && m.memberId === memberId);
    const countField = type === 'lunch' ? 'lunchCount' : 'dinnerCount';
    
    if (existingIndex >= 0) {
      const updated = [...meals];
      updated[existingIndex] = {
        ...updated[existingIndex],
        [type]: count > 0,
        [countField]: count,
      };
      setMeals(updated);
    } else {
      const newMeal: DailyMeal = {
        date,
        memberId,
        lunch: type === 'lunch' ? count > 0 : false,
        dinner: type === 'dinner' ? count > 0 : false,
        lunchCount: type === 'lunch' ? count : 0,
        dinnerCount: type === 'dinner' ? count : 0,
      };
      setMeals([...meals, newMeal]);
    }
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const addExtraExpense = (expense: Omit<ExtraExpense, 'id'>) => {
    const newExpense: ExtraExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExtraExpenses([...extraExpenses, newExpense]);
  };

  const removeExtraExpense = (id: string) => {
    setExtraExpenses(extraExpenses.filter(e => e.id !== id));
  };

  const addDeposit = (deposit: Omit<Deposit, 'id'>) => {
    const newDeposit: Deposit = {
      ...deposit,
      id: Date.now().toString(),
    };
    setDeposits([...deposits, newDeposit]);
  };

  const removeDeposit = (id: string) => {
    setDeposits(deposits.filter(d => d.id !== id));
  };

  const addMaidPayment = (payment: Omit<MaidPayment, 'id'>) => {
    const newPayment: MaidPayment = {
      ...payment,
      id: Date.now().toString(),
    };
    setMaidPayments([...maidPayments, newPayment]);
  };

  const removeMaidPayment = (id: string) => {
    setMaidPayments(maidPayments.filter(p => p.id !== id));
  };

  const addShopTransaction = (transaction: Omit<ShopTransaction, 'id'>) => {
    const newTransaction: ShopTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setShopTransactions([...shopTransactions, newTransaction]);
  };

  const removeShopTransaction = (id: string) => {
    setShopTransactions(shopTransactions.filter(t => t.id !== id));
  };

  const getShopBalance = () => {
    const totalPurchase = shopTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayment = shopTransactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalPurchase - totalPayment; // positive = বাকি, negative = অগ্রিম
    return { totalPurchase, totalPayment, balance };
  };

  const getMealsForDate = (date: string): DailyMeal[] => {
    return members.filter(m => m.isActive).map(member => {
      const existing = meals.find(m => m.date === date && m.memberId === member.id);
      return existing || { date, memberId: member.id, lunch: false, dinner: false };
    });
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(m => m.date === today);
    // lunchCount এবং dinnerCount সাপোর্ট সহ
    const lunchCount = todayMeals.reduce((acc, m) => acc + (m.lunchCount ?? (m.lunch ? 1 : 0)), 0);
    const dinnerCount = todayMeals.reduce((acc, m) => acc + (m.dinnerCount ?? (m.dinner ? 1 : 0)), 0);
    // দুপুর = ১ মিল, রাত = ০.৫ মিল
    const total = (lunchCount * 1) + (dinnerCount * 0.5);
    return { lunch: lunchCount, dinner: dinnerCount, total };
  };

  const getMonthlyStats = () => {
    // সব মাসের হিসাব একসাথে (কোন মাস ফিল্টার নেই)
    const totalMeals = meals.reduce((acc, m) => {
      const lunchCount = m.lunchCount ?? (m.lunch ? 1 : 0);
      const dinnerCount = m.dinnerCount ?? (m.dinner ? 1 : 0);
      // দুপুর = ১ মিল, রাত = ০.৫ মিল
      return acc + (lunchCount * 1) + (dinnerCount * 0.5);
    }, 0);

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalExtraExpenses = extraExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalDeposits = deposits.reduce((acc, d) => acc + d.amount, 0);
    const totalMaidPayments = maidPayments.reduce((acc, p) => acc + p.amount, 0);

    // মিল রেট = (বাজার খরচ + অতিরিক্ত খরচ) / মোট মিল
    const mealRate = totalMeals > 0 ? (totalExpenses + totalExtraExpenses) / totalMeals : 0;

    return { totalMeals, totalExpenses, totalExtraExpenses, totalDeposits, totalMaidPayments, mealRate };
  };

  const getMemberSummaries = (): MemberSummary[] => {
    const { mealRate } = getMonthlyStats();

    return members.filter(m => m.isActive).map(member => {
      // সব মাসের মিল (মাস ফিল্টার ছাড়া)
      const memberMeals = meals.filter(m => m.memberId === member.id);

      const totalLunch = memberMeals.reduce((acc, m) => acc + (m.lunchCount ?? (m.lunch ? 1 : 0)), 0);
      const totalDinner = memberMeals.reduce((acc, m) => acc + (m.dinnerCount ?? (m.dinner ? 1 : 0)), 0);
      // দুপুর = ১ মিল, রাত = ০.৫ মিল
      const totalMeals = (totalLunch * 1) + (totalDinner * 0.5);
      const totalCost = totalMeals * mealRate;

      // সব মাসের জমা (মাস ফিল্টার ছাড়া)
      const memberDeposits = deposits.filter(d => d.memberId === member.id);
      const totalDeposit = memberDeposits.reduce((acc, d) => acc + d.amount, 0);
      const balance = totalDeposit - totalCost;

      return {
        memberId: member.id,
        name: member.name,
        totalMeals,
        totalLunch,
        totalDinner,
        totalCost,
        totalDeposit,
        balance,
      };
    });
  };

  const exportData = (): string => {
    const data: StoredData = {
      members,
      meals,
      expenses,
      extraExpenses,
      deposits,
      maidPayments,
      shopTransactions,
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString) as StoredData;
      if (data.members && data.meals && data.expenses && data.deposits && data.maidPayments) {
        setMembers(data.members);
        setMeals(data.meals);
        setExpenses(data.expenses);
        setExtraExpenses(data.extraExpenses || []);
        setDeposits(data.deposits);
        setMaidPayments(data.maidPayments);
        setShopTransactions(data.shopTransactions || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  const clearAllData = () => {
    setMembers(defaultMembers);
    setMeals([]);
    setExpenses([]);
    setExtraExpenses([]);
    setDeposits([]);
    setMaidPayments([]);
    setShopTransactions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <MealContext.Provider value={{
      members,
      meals,
      expenses,
      extraExpenses,
      deposits,
      maidPayments,
      shopTransactions,
      addMember,
      removeMember,
      toggleMemberStatus,
      updateMeal,
      updateMealCount,
      addExpense,
      removeExpense,
      addExtraExpense,
      removeExtraExpense,
      addDeposit,
      removeDeposit,
      addMaidPayment,
      removeMaidPayment,
      addShopTransaction,
      removeShopTransaction,
      getShopBalance,
      getMealsForDate,
      getTodayStats,
      getMonthlyStats,
      getMemberSummaries,
      exportData,
      importData,
      clearAllData,
    }}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeal() {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMeal must be used within a MealProvider');
  }
  return context;
}
