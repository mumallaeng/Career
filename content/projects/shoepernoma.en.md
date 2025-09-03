---
title: "Store-Integrated Robot-Based Shoe Picking System Shoepernoma"
date: 2025-05-27T00:00:00+09:00
draft: false
author: "YONMILK"
description: "ROS2-based automated shoe picking system"
tags: ["ros2", "robotics", "automation", "picking-system", "database", "tcp-udp"]
categories: ["projects"]
translationKey: "shoepernoma"
featured: true
isAutoTranslated: true
originalLang: "ko"
---

*This post has been automatically translated from Korean. [View original](../../ko/projects/shoepernoma/)*

Developed a ROS2-based store-integrated shoe picking robot system as project team leader.

<!--more-->

## Project Overview
- **Duration**: April 9 ~ May 27, 2025 (6 weeks)
- **Role**: Project Leader and Main Service Developer
- **Achievement**: Excellence Award (1st place) AddinEdu Academy Guro-Gasan Center

## Tech Stack
- **Platform**: ROS2
- **Languages**: Python, C++
- **Database**: MySQL, ORM
- **Communication**: TCP/UDP, Action/Service/Topic
- **Hardware**: Servo motors, rack/cart system

## Key Responsibilities

### Main Service Architecture Design
- Designed ROS2 Action/Service/Topic-based modules and implemented task processing logic
- Configured topic/service flow and event communication handling integrated with GUI

### Controller and ROS2 Package Development
- Refactored cart_controller and rack_controller modules for rack/cart control
- Developed roscar_arm_controller with built-in servo motor control logic

### DB Integration and ORM-based Structure Design
- Defined query/table structure based on sequence diagrams and applied SSL configuration
- Configured multi-DB ORM for log storage and interface recording

### System Integration and Optimization
- AI module integration based on TCP/UDP and file system event processing
- Monorepo-based package structure reorganization and execution script automation
- Unified code naming/directory structure, improved documentation and maintainability

## Key Achievements
- Implemented automated picking system integrated with store inventory management
- Developed real-time robot control and status monitoring system
- Secured future system scalability through scalable architecture design