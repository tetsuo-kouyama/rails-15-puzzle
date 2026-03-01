FactoryBot.define do
  factory :score do
    user_name { "テストユーザー" }
    clear_time { 120 }
    difficulty { 15 } # デフォルト値を決めておく
  end
end
