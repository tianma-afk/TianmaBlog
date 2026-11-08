<script setup lang="ts">
import { resume } from '~/data/resume'
import '~/assets/css/resume.css'

const enteredThisVisit = useState('entered-reading-room', () => false)
enteredThisVisit.value = true
const { homeHref } = useSiteLinks()

useSeoMeta({
  title: `${resume.name} - ${resume.role}`,
  description: `${resume.name}的${resume.role}简历。华南理工大学软件工程本科，项目经验、大模型应用与软件开发实践。`,
  robots: 'noindex, nofollow',
  themeColor: '#f7faff',
})
useHead({ htmlAttrs: { class: 'resume-mode' } })

function printResume() {
  window.print()
}
</script>

<template>
  <div class="resume-page">
    <nav class="resume-toolbar" aria-label="简历操作">
      <NuxtLink :to="homeHref" :external="homeHref !== '/'" class="resume-back">
        <ResumeIcon name="arrow" />回到书架
      </NuxtLink>
      <ClientOnly>
        <button type="button" @click="printResume"><ResumeIcon name="print" />打印 / 保存 PDF</button>
      </ClientOnly>
    </nav>

    <main id="resume-content" class="resume-paper" aria-labelledby="resume-name">
      <header class="resume-header">
        <h1 id="resume-name" data-resume-field="name">{{ resume.name }}</h1>
        <p class="resume-position">{{ resume.role }}</p>
        <div class="resume-info">
          <ul>
            <li><ResumeIcon name="phone" /><span>电话：<span data-resume-field="phone">{{ resume.phone }}</span></span></li>
            <li><ResumeIcon name="mail" /><span>邮箱：<span data-resume-field="email">{{ resume.email }}</span></span></li>
            <li><ResumeIcon name="github" /><span>GitHub：<a :href="`https://github.com/${resume.github}`" target="_blank" rel="noopener noreferrer">{{ resume.github }}</a></span></li>
          </ul>
          <ul>
            <li class="resume-school"><ResumeIcon name="school" /><span>学校：</span><img class="resume-school-logo" src="/images/scut-logo.png" :alt="resume.school" width="920" height="290" decoding="async"><span>(985)</span></li>
            <li><ResumeIcon name="degree" /><span>学历：{{ resume.degree }}</span></li>
            <li><ResumeIcon name="chart" /><span>绩点：{{ resume.academicStanding }}<span class="resume-info-divider" aria-hidden="true"> · </span>政治面貌：{{ resume.politicalStatus }}</span></li>
          </ul>
        </div>
      </header>

      <ResumeSection title="个人技能">
        <ul class="resume-points">
          <li v-for="skill in resume.skills" :key="skill">{{ skill }}</li>
        </ul>
      </ResumeSection>

      <ResumeSection title="项目经验">
        <ResumeEntry v-for="project in resume.projects" :key="project.name" :name="project.name" :description="project.description" :role="project.role" :techs="project.techs">
          <ul v-if="project.points.length" class="resume-points">
            <li v-for="point in project.points" :key="point">{{ point }}</li>
          </ul>
        </ResumeEntry>
      </ResumeSection>

      <ResumeSection title="个人证书">
        <ul class="resume-points"><li v-for="certificate in resume.certificates" :key="certificate">{{ certificate }}</li></ul>
      </ResumeSection>
    </main>

    <footer class="resume-footer">排版参考 <a href="https://github.com/L33Z22L11/zhilu-cv" target="_blank" rel="noopener noreferrer">zhilu-cv</a><span aria-hidden="true"> · </span>Built with Nuxt</footer>
  </div>
</template>
