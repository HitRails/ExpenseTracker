class AccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :number, :balance
end
