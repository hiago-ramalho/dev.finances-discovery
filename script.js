const modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add("active")
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove("active")
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

//preciso somar as entradas
//depois eu preciso somas as saídas
//depois remover do total das entradas o valor das saídas
// assim eu terei o total(entradas - saídas)
const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        //somar todas as entradas
        let income = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },
    expenses() {
        //somar as saídas
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },
    total() {
        //entradas - saídas
        return Transaction.incomes() + Transaction.expenses()
    }
}

//preciso pegar e substituir os dados do html com os dados do JS

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html =
            `
            <td class="description">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação">
            </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById("income-display").innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById("expense-display").innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById("total-display").innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splitedDate = date.split("-")

        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },

}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos.")
        } //trim faz uma limpessa nos espaços vazios
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()// interrompe o comportamento padrão da página.

        try {
            //1 verificar se todas a informações foram preenchidas
            Form.validateFields()
            //2 formatar os dados para salvá-los
            const transaction = Form.formatValues()
            //3 salvar os dados
            Transaction.add(transaction)
            //4 apagar os dados do formulário
            Form.clearFields()
            //5 fechar o modal
            modal.close()
            //6 atualizar a aplicação (já existe um reload dentro de "Transaction.add()")
        } catch (error) {
            alert(error.message)
        }


    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

