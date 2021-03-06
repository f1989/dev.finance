const Modal = {
    open(title='Nova Transação'){
    //abrir modal
    //adicionar a classe "active" ao modal
    document
        .querySelector('.modal-overlay')
        .classList
        .add('active')

    document
        .getElementById('title_transaction')
        .innerHTML = title
    },

    close(){
    //fechar o modal
    //remover a classe "active" ao modal
    document
        .querySelector('.modal-overlay')
        .classList
        .remove('active')
        
        Form.clearFields()
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

//Transaction é um objeto
const Transaction = {

    //atalho dentro do objeto Transaction para todas as transacoes (refatoracao)
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    update(transaction,index){
        Transaction.all[index] = transaction
        App.reload()
    },

    incomes(){
        let income = 0;
        //pegar todas as transacoes
        //para cada transacao
        Transaction.all.forEach(transaction => {
            //se for maior que 0
            if(transaction.amount > 0){
                //somar a uma variavel e retorna-la
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses(){
        let expense = 0;
        //pegar todas as transacoes
        //para cada transacao
        Transaction.all.forEach(transaction => {
            //se for menor que 0
            if(transaction.amount < 0){
                //somar a uma variavel e retorna-la
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total(){
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    
    transacitonsContainer: document.querySelector('#data-table tbody'),
    
    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        
        DOM.transacitonsContainer.appendChild(tr)
    },

    updateTransaction(index){
        const valueToUpdate = Transaction.all.filter((item,idx) => index === idx)[0]
        Form.setValues(valueToUpdate.description,Utils.formatUpdateAmount(valueToUpdate.amount),Utils.formatUpdateDate(valueToUpdate.date),index)
        Modal.open('Alterar Transação')
    },

    innerHTMLTransaction(transaction, index){
        
        //muda a classe (cor) do CSS se valor que veio foi positivo ou negativo
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        
        //formatacao da moeda
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="DOM.updateTransaction(${index})" src="./assets/pencil.svg" alt="Alterar transação">
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html
    },

    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transacitonsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = value * 100
        return Math.round(value)
    },

    formatUpdateAmount(value){
        value = value / 100
        return value.toFixed(2)
    },

    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatUpdateDate(date){
        const splittedDate = date.split("/")
        return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "- " : ""
        
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    id: document.querySelector('input#id_transaction'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    setValues(description, amount, date, id){
            Form.description.value = description
            Form.amount.value = amount
            Form.date.value = date
            Form.id.value = id
    },

    validateFields(){
        const {description, amount, date} = Form.getValues()
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "" ){
            throw new Error("Por favor, preencha todos os campos!")
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues()
       
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return{
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
        Form.id.value = ""
    },

    submit(event){
        //interrompe comportamento padrao do form que é enviar dados
        event.preventDefault()

        id = document.getElementById('id_transaction').value

        try {
            //verificar se todas as informacoes foram preenchidas
            Form.validateFields()
            
            //formatar os dados para salvar
            const transaction = Form.formatValues()
            

            if(id != ''){
                Transaction.update(transaction,id)                
            }else{
                //salvar
                Transaction.add(transaction)
            }
            
            //apagar os dados do formulario
            Form.clearFields()

            //fecar modal
            Modal.close()

            //atualizar a aplicacao
            //nao precisa atualizar aqui pois ja tem um App.reload() no add do Transaction
            
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init(){
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },

    reload(){
        DOM.clearTransactions()
        App.init()
    },
}

App.init()