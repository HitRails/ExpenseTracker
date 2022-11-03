class ExpensesController < ApplicationController
  before_action :find_expense, only: [:show, :update, :destroy]

  def index
    expenses = Expense.order(date: :desc)
    render json: expenses, collection_serializer: ExpenseSerializer
  end

  def show
    render json: @expense, each_serializer: ExpenseSerializer
  end

  def create
    expense = Expense.new(expense_params)
    if expense.save
      render json: expense, each_serializer: ExpenseSerializer
    else
      render json: { error: expense.errors.full_messages.first }, status: :unprocessable_entity
    end
  end

  def update
    if @expense.update(expense_params)
      render json: @expense, each_serializer: ExpenseSerializer
    else
      render json: { error: @expense.errors.full_messages.first }, status: :unprocessable_entity
    end
  end

  def destroy
    if @expense.destroy
      render json: @expense, each_serializer: ExpenseSerializer
    else
      render json: {message: 'Expense Not Deleted.' }, status: :unprocessable_entity
    end
  end

  private

  def expense_params
    params.permit(:amount, :date, :description, :account_id)
  end

  def find_expense
    @expense = Expense.find(params[:id])
    return render json: {message: 'Expense Not Found.'}, status: 404 unless @expense.present?
  end
end
