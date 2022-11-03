class ExpenseSerializer < ActiveModel::Serializer
  attributes :id, :amount, :date, :description, :account
end
