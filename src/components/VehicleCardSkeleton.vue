<template>
  <div class="skeleton-card">
    <div class="skeleton-img shimmer"></div>
    <div class="skeleton-body">
      <div class="skeleton-title shimmer"></div>
      <div class="skeleton-tags">
        <div class="skeleton-tag shimmer"></div>
        <div class="skeleton-tag shimmer"></div>
        <div class="skeleton-tag skeleton-tag--price shimmer"></div>
      </div>
      <div class="skeleton-btn shimmer"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -600px 0;
  }
  100% {
    background-position: 600px 0;
  }
}

.shimmer {
  background: linear-gradient(90deg, #e8ecf5 25%, #f4f6fb 50%, #e8ecf5 75%);
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 6px;
}

.skeleton-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.skeleton-img {
  width: 100%;
  height: 180px;
  border-radius: 0;
}

.skeleton-body {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.skeleton-title {
  height: 18px;
  width: 65%;
}

.skeleton-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.skeleton-tag {
  height: 26px;
  width: 80px;
  border-radius: 20px;
}

.skeleton-tag--price {
  width: 60px;
}

.skeleton-btn {
  height: 38px;
  width: 100%;
  border-radius: 8px;
}
</style>
