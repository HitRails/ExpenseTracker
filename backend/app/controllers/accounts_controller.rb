class AccountsController < ApplicationController
  before_action :find_account, only: [:show, :update, :destroy]

  def index
    accounts = Account.order(date: :desc)
    render json: accounts, collection_serializer: AccountSerializer
  end

  def show
    render json: @account, each_serializer: AccountSerializer
  end

  def create
    account = Account.new(account_params)
    if account.save
      render json: account, each_serializer: AccountSerializer
    else
      render json: { error: account.errors.full_messages.first }, status: :unprocessable_entity
    end
  end

  def update
    if @account.update(account_params)
      render json: @account, each_serializer: AccountSerializer
    else
      render json: { error: @account.errors.full_messages.first }, status: :unprocessable_entity
    end
  end

  def destroy
    if @account.destroy
      render json: {message: 'Account Deleted Successfully.' }, status: :ok
    else
      render json: {error: 'Acc Not Deleted.' }, status: :unprocessable_entity
    end
  end

  private

  def account_params
    params.permit(:name, :number)
  end

  def find_account
    @account = Account.find(params[:id])
    return render json: {message: 'Account Not Found.'}, status: 404 unless @account.present?
  end
end
