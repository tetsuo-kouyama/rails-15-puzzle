class User < ApplicationRecord
  has_many :scores, dependent: :destroy
  validates :name, presence: true, uniqueness: true, length: { maximum: 10 }
end
