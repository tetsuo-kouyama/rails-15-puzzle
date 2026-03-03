FactoryBot.define do
  factory :score do
    clear_time { 120 }
    difficulty { 15 } # デフォルト値を決めておく
  end
end
