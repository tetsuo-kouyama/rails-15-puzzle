require "test_helper"

class ScoresControllerTest < ActionDispatch::IntegrationTest
  setup do
    @score = scores(:one)
  end

  test "should get index" do
    get scores_url
    assert_response :success
  end

  test "should create score" do
    assert_difference("Score.count") do
      post scores_url, params: {
        score: { clear_time: @score.clear_time, difficulty: @score.difficulty }
      }, as: :json
    end

    assert_response :success

    json_response = JSON.parse(response.body)
    assert_includes json_response, "rank"
  end

  test "should create score with user_id when logged in" do
    user = users(:one)

    post login_url, params: { session: { name: user.name } }

    assert_not_nil session[:user_id], "ログインセッションが作成されていません"

    assert_difference("Score.count") do
      post scores_url, params: {
        score: { clear_time: 100, difficulty: 24 }
      }, as: :json
    end

    new_score = Score.last
    assert_equal user.id, new_score.user_id

    assert_response :success

    json_response = JSON.parse(response.body)
    assert_not_nil json_response["rank"]
  end
end
