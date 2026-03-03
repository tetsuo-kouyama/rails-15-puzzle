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
      post scores_url, params: { score: { clear_time: @score.clear_time, difficulty: @score.difficulty } }
    end

    assert_redirected_to scores_url(difficulty: @score.difficulty)
  end

  test "should create score with user_id when logged in" do
    user = users(:one)
    post login_url, params: { session: { name: user.name } }

    assert_difference("Score.count") do
      post scores_url, params: {
        score: { clear_time: 100, difficulty: 24 }
      }
    end

    assert_equal user.id, Score.last.user_id
  end
end
