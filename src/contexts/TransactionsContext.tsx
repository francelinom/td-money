import { ReactNode, useCallback, useEffect, useState } from "react";
import { api } from "../lib/axios";
import { createContext } from "use-context-selector";

export interface Transaction {
    id: number
    description: string
    type: 'income' | 'outcome'
    price: number
    category: string
    createdAt: string
}

interface TransactionsContextType {
    transactions: Transaction[],
    fetchTransactions: (query?: string) => Promise<void>,
    createTransaction: (data: CreateTransactionInput) => Promise<void>
}

interface TransactionsProviderProps {
    children: ReactNode
}

interface CreateTransactionInput {
    description: string
    price: number
    category: string
    type: 'income' | 'outcome'
}

export const TransactionContext = createContext<TransactionsContextType>({} as TransactionsContextType)

export function TransactionsProvider({ children }: TransactionsProviderProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([])

    const fetchTransactions = useCallback(async (query?: string) => {
        const response = await api.get('transactions', {
            params: {
                _sort: 'createdAt',
                _order: 'desc',
                description: query,
            }
        })

        setTransactions(response.data)
    }, [])

    const createTransaction = useCallback(
        async (data: CreateTransactionInput) => {
            const { description, price, category, type } = data
            const response = await api.post('/transactions', {
                description,
                price,
                category,
                type,
                createdAt: new Date()
            })

            setTransactions(state => [...state, response.data])
        }, []
    )

    useEffect(() => {
        fetchTransactions()
    }, [])

    return (
        <TransactionContext.Provider value={{ transactions, fetchTransactions, createTransaction }}>
            {children}
        </TransactionContext.Provider>
    )
}