PROJECT MANAGEMENT SYSTEM(PMS)

โปรเจคนี้สร้างขึ้นมาเพื่อใช้ในการบริหารเเละจัดการทรัพยากรบุคคลในบริสัทโดยการออกเเบบมีดังนี้

-เเบ่งทีมตาม Project ที่ทำ | Skill ที่ต้องใช้
-workload ต่อคน >> AVG ต่อทีม
-Progress งาน รายสัปดาห์

![image](https://github.com/user-attachments/assets/ffd2ea29-a407-4b92-a1b6-e6f1259a780d)

[GET] /api/v1/team () --> return(teams string[]) # return all team
[GET] /api/v1/team/member/:id () --> return(employees string[]) # return all employee in team by id

[GET] /api/v1/workload (int) --> return (int) # return their workload
[POST] /api/v1/workload (int) --> return (int) # set workload for that employee / return their set workload
[PUT] /api/v1/workload (int) --> return (int) # set workload for that employee / return their set workload

[GET] /api/progress/:id () --> return project progress by project id 
[POST] /api/progress/:id () --> set progress/return project progress by project id 
[PUT] /api/progress/:id () --> set progress/return project progress by project id 


.............
