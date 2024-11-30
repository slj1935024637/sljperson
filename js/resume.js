document.addEventListener('DOMContentLoaded', () => {
    // 技能条动画
    const skillBars = document.querySelectorAll('.skill-level');
    const skillsSection = document.querySelector('.skills-section');

    const animateSkills = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillBars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
                observer.unobserve(entry.target);
            }
        });
    };

    const skillsObserver = new IntersectionObserver(animateSkills, {
        threshold: 0.5
    });

    skillsObserver.observe(skillsSection);

    // 时间线项目动画
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const animateTimeline = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    };

    const timelineObserver = new IntersectionObserver(animateTimeline, {
        threshold: 0.2
    });

    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.6s ease';
        timelineObserver.observe(item);
    });

    // 项目卡片动画
    const projectItems = document.querySelectorAll('.project-item');
    
    const animateProjects = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    };

    const projectsObserver = new IntersectionObserver(animateProjects, {
        threshold: 0.2
    });

    projectItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.6s ease';
        projectsObserver.observe(item);
    });
});
