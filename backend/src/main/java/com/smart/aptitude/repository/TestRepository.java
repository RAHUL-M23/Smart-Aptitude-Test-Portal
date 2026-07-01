package com.smart.aptitude.repository;

import com.smart.aptitude.model.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByCategoryIgnoreCase(String category);
}
