(function($) {
  'use strict';
  console.log('testest');

  // 전역 변수 선언
  let canvas, ctx, particles, ww, wh;
  let totalParticles; // 전체 입자 수
  const desiredRedParticles = 777; // 빨간색으로 설정할 입자 수

  // 이미지 불러오기
  let image = new Image();
  image.src = 'img/mapimg.png'; // 여기에 실제 이미지 경로를 넣어주세요.

  // 캔버스 및 크기 설정
  function initScene() {
    particles = [];  // 입자 배열 초기화
    ww = canvas.width = window.innerWidth;
    wh = canvas.height = window.innerHeight;

    // 이미지 로드 후 작업
    image.onload = function() {
      ctx.clearRect(0, 0, ww, wh);  // 캔버스 초기화
      ctx.drawImage(image, (ww - image.width) / 2, (wh - image.height) / 2); // 이미지를 캔버스 중앙에 그림

      // 이미지에서 픽셀 데이터 추출 후 입자 생성
      particles = getParticlesFromImage(ctx);
      totalParticles = particles.length; // 전체 입자 수 저장
      console.log(`Total particles: ${totalParticles}`); // 전체 입자 수 로그
      animateParticlesToCenter(); // 입자들이 중앙으로 모이도록 애니메이션 시작
    };
  }

  // 이미지 데이터를 기반으로 입자를 생성하는 함수
  function getParticlesFromImage(ctx) {
    const imageData = ctx.getImageData(0, 0, ww, wh).data; // 캔버스에서 이미지 데이터 가져오기
    const particleArray = [];
    const pixelSize = 6; // 픽셀 간격 설정 (입자 간 간격을 6으로 설정)

    for (let y = 0; y < wh; y += pixelSize) {
      for (let x = 0; x < ww; x += pixelSize) {
        const alpha = imageData[(x + y * ww) * 4 + 3]; // 알파 값 추출 (투명도)

        if (alpha > 128) {  // 특정 투명도 이상일 때만 입자 생성
          const particle = new Particle(x, y, 2); // 랜덤한 크기의 입자 생성
          particleArray.push(particle);
        }
      }
    }

    return particleArray;
  }

  // 입자들을 가장자리부터 채우도록 그룹화하는 함수
  function groupParticlesByDistance(particles, centerX, centerY) {
      // 입자들의 거리를 기준으로 그룹화
      return particles.sort((a, b) => {
          const distA = Math.hypot(a.x - centerX, a.y - centerY);
          const distB = Math.hypot(b.x - centerX, b.y - centerY);
          return distA - distB; // 거리가 가까운 것부터 정렬
      });
  }

  // 입자들이 중앙으로 모이도록 애니메이션하는 함수
  function animateParticlesToCenter() {
    const startTime = performance.now();
    const duration = 1000; // 애니메이션 지속 시간 (1초)

    function updateAnimation(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1); // 애니메이션 진행 비율 (0에서 1까지)
      const centerX = ww / 2;
      const centerY = wh / 2;

      particles.forEach((particle, index) => {
        // 선형 보간법을 사용하여 입자의 위치를 중앙으로 이동
        particle.x = particle.originalX + (centerX - particle.originalX) * progress;
        particle.y = particle.originalY + (centerY - particle.originalY) * progress;
      });

      // 빨간색으로 설정할 입자 수를 조정
      let particleCount = Math.floor((desiredRedParticles/totalParticles)*100);
      let redVal = totalParticles*(particleCount/100);
      const redParticlesCount = Math.min(redVal, totalParticles);
      console.log(`redParticlesCount: ${redParticlesCount}`);

      // 전체 배열을 역순으로 순회하여 색상 설정
      particles.slice(-redParticlesCount).forEach((particle) => {
        particle.color = 'yellow'; // 진척도에 따라 빨간색으로 설정
      });

      // 나머지 입자 색상 설정
      particles.slice(0, totalParticles - redParticlesCount).forEach((particle) => {
        particle.color = 'white'; // 나머지 입자는 흰색으로 설정
      });

      ctx.clearRect(0, 0, ww, wh);  // 캔버스 초기화
      ctx.beginPath();
      particles.forEach(particle => {
        particle.draw(ctx); // 입자 그리기
      });
      ctx.fill();

      if (progress < 1) {
      //   requestAnimationFrame(updateAnimation);  // 애니메이션 계속 진행
      } else {
      //   renderParticles(); // 애니메이션 완료 후 입자 렌더링 시작
      }
    }

    requestAnimationFrame(updateAnimation); // 애니메이션 시작
  }

  // 입자 렌더링 함수
  function renderParticles() {
    ctx.clearRect(0, 0, ww, wh);  // 캔버스 초기화
    ctx.beginPath();

    particles.forEach(particle => {
      particle.update();  // 입자 위치 업데이트
      particle.draw(ctx); // 입자 그리기
    });

    ctx.fill();
    requestAnimationFrame(renderParticles);  // 애니메이션 반복
  }

  // 입자 클래스 정의
  class Particle {
    constructor(x, y, radius) {
      this.originalX = x; // 원래의 X 위치 저장
      this.originalY = y; // 원래의 Y 위치 저장
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = 'white'; // 기본 색상은 흰색
      this.vx = Math.random() * 2 - 1;  // X축 속도
      this.vy = Math.random() * 2 - 1;  // Y축 속도
    }

    update() {
      this.x += this.vx;  // 위치 업데이트
      this.y += this.vy;

      // 경계 충돌 감지 및 반사
      if (this.x <= 0 || this.x >= ww) this.vx *= -1;
      if (this.y <= 0 || this.y >= wh) this.vy *= -1;
    }

    draw(ctx) {
      ctx.fillStyle = this.color; // 입자의 색상 설정
      ctx.beginPath(); // beginPath 추가
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);  // 원형 입자 그리기
      ctx.fill(); // fill을 draw 내부에서 호출
    }
  }

  // 초기화 및 실행
  $(document).ready(function() {
    canvas = document.getElementById('banner-scene');
    ctx = canvas.getContext('2d');

    initScene();  // 씬 초기화
  });
})(jQuery);
