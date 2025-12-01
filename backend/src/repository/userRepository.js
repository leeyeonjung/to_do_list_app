// 인메모리 사용자 데이터베이스
let users = [];
let nextId = 1;

class UserRepository {
  /**
   * 모든 사용자 조회
   */
  findAll() {
    return [...users];
  }

  /**
   * ID로 사용자 조회
   */
  findById(id) {
    return users.find(user => user.id === parseInt(id));
  }

  /**
   * OAuth ID와 provider로 사용자 조회
   */
  findByOAuthId(oauthId, provider) {
    return users.find(user => 
      user.oauthId === oauthId && user.provider === provider
    );
  }

  /**
   * 이메일로 사용자 조회
   */
  findByEmail(email) {
    return users.find(user => user.email === email);
  }

  /**
   * 새 사용자 생성
   */
  create(userData) {
    const newUser = {
      id: nextId++,
      oauthId: userData.oauthId,
      provider: userData.provider, // 'kakao' or 'naver'
      email: userData.email,
      nickname: userData.nickname,
      profileImage: userData.profileImage || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  }

  /**
   * 사용자 정보 업데이트
   */
  update(id, userData) {
    const user = this.findById(id);
    if (!user) {
      return null;
    }

    if (userData.nickname !== undefined) user.nickname = userData.nickname;
    if (userData.profileImage !== undefined) user.profileImage = userData.profileImage;
    user.updatedAt = new Date().toISOString();

    return user;
  }

  /**
   * 사용자 삭제
   */
  delete(id) {
    const index = users.findIndex(user => user.id === parseInt(id));
    if (index === -1) {
      return false;
    }
    users.splice(index, 1);
    return true;
  }
}

module.exports = new UserRepository();

