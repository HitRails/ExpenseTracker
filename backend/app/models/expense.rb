class Expense < ApplicationRecord
  belongs_to :account
  validates :amount, :date, :description, presence: true
  validates :amount, numericality: { greater_than: 0, only_integer: true }
  validate :check_account_balance
  before_update :update_account_balance
  after_save :update_current_account_balance

  private

  def check_account_balance
    if amount_changed? && !account_id_changed?
      privious_amount = changes['amount'][0]
      self.account.update_columns(balance: self.account.balance + privious_amount)
    end
    return errors.add(:base, 'Insufficient Balance') unless self.account.balance >= amount
  end

  def update_current_account_balance
    self.account.update_columns(balance:(self.account.balance - self.amount))
  end

  def update_account_balance
    if account_id_changed?
      privious_amount = changes['amount'] ? changes['amount'][0] : self.amount
      previous_account_id = changes['account_id'][0]
      previous_account = Account.find_by(id: previous_account_id)
      new_amount = previous_account.balance + privious_amount
      previous_account.update_columns(balance: new_amount)
    end
  end
end
