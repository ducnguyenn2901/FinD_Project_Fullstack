import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Search, Download, Plus, MoreVertical } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface Transaction {
    id: number
    date: string
    description: string
    amount: number
    category: string
    wallet: string
    type: 'income' | 'expense'
}

const TransactionHistory = () => {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')

    const transactions: Transaction[] = [
        { id: 1, date: '2024-01-15', description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', wallet: 'Main Card', type: 'expense' },
        { id: 2, date: '2024-01-14', description: 'Monthly Salary', amount: 2500.00, category: 'Income', wallet: 'Bank Account', type: 'income' },
        { id: 3, date: '2024-01-13', description: 'Grocery Store', amount: -85.50, category: 'Food', wallet: 'Main Card', type: 'expense' },
        { id: 4, date: '2024-01-12', description: 'Gas Station', amount: -45.00, category: 'Transport', wallet: 'Credit Card', type: 'expense' },
        { id: 5, date: '2024-01-11', description: 'Freelance Project', amount: 500.00, category: 'Income', wallet: 'PayPal', type: 'income' },
        { id: 6, date: '2024-01-10', description: 'Restaurant Dinner', amount: -65.75, category: 'Food', wallet: 'Main Card', type: 'expense' },
        { id: 7, date: '2024-01-09', description: 'Amazon Purchase', amount: -129.99, category: 'Shopping', wallet: 'Main Card', type: 'expense' },
        { id: 8, date: '2024-01-08', description: 'Electricity Bill', amount: -85.30, category: 'Bills', wallet: 'Bank Account', type: 'expense' },
    ]

    const categories = ['All', 'Income', 'Food', 'Entertainment', 'Transport', 'Shopping', 'Bills', 'Healthcare']
    // const wallets = ['All Wallets', 'Main Card', 'Bank Account', 'Credit Card', 'PayPal', 'Savings']

    const getAmountColor = (amount: number) => {
        return amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    }

    const formatAmount = (amount: number) => {
        return amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`
    }

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Income': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'Food': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            'Entertainment': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            'Transport': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'Shopping': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
            'Bills': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            'Healthcare': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        }
        return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(search.toLowerCase()) ||
            transaction.category.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === 'all' || transaction.category === filter
        return matchesSearch && matchesFilter
    })

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const netBalance = totalIncome - totalExpenses

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${netBalance.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Recent Transactions</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search transactions..."
                                    className="pl-9 w-full"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category.toLowerCase()}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Wallet</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">{transaction.date}</TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell>
                                            <Badge className={getCategoryColor(transaction.category)}>
                                                {transaction.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{transaction.wallet}</TableCell>
                                        <TableCell className={`text-right font-medium ${getAmountColor(transaction.amount)}`}>
                                            {formatAmount(transaction.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredTransactions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No transactions found. Try a different search or filter.
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {filteredTransactions.length} of {transactions.length} transactions
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Transaction
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default TransactionHistory
