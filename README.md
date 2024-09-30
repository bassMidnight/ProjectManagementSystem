PROJECT MANAGEMENT SYSTEM(PMS)

โปรเจคนี้สร้างขึ้นมาเพื่อใช้ในการบริหารเเละจัดการทรัพยากรบุคคลในบริษัทโดยการออกเเบบมีดังนี้

-เเบ่งทีมตาม Project ที่ทำ | Skill ที่ต้องใช้
-workload ต่อคน >> AVG ต่อทีม
-Progress งาน รายสัปดาห์

![image](https://github.com/user-attachments/assets/2e2ff8a0-ff49-4609-b9eb-a7b6717782e3)


[GET] /api/v1/team () --> return(teams string[]) # return all team
[GET] /api/v1/team/member/:id () --> return(employees string[]) # return all employee in team by id

[GET] /api/v1/workload (int) --> return (int) # return their workload
[POST] /api/v1/workload (int) --> return (int) # set workload for that employee / return their set workload
[PUT] /api/v1/workload (int) --> return (int) # set workload for that employee / return their set workload

[GET] /api/progress/:id () --> return project progress by project id 
[POST] /api/progress/:id () --> set progress/return project progress by project id 
[PUT] /api/progress/:id () --> set progress/return project progress by project id 


.............
