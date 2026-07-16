package com.smart.aptitude.repository;

import com.smart.aptitude.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByUser_IdOrderBySubmittedAtDesc(Long userId);
    List<Result> findAllByOrderBySubmittedAtDesc();
    List<Result> findByTest_TestIdOrderBySubmittedAtDesc(Long testId);
    boolean existsByUser_IdAndTest_TestId(Long userId, Long testId);
}
