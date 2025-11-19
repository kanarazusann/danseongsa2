package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "WISHLIST", uniqueConstraints = {
    @UniqueConstraint(name = "UK_WISHLIST_USER_POST", columnNames = {"USERID", "POSTID"})
})
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "wishlist_seq")
    @SequenceGenerator(name = "wishlist_seq", sequenceName = "SEQ_WISHLIST_WISHLISTID", allocationSize = 1)
    @Column(name = "WISHLISTID")
    private int wishlistId;

    @Column(name = "USERID", nullable = false, insertable = false, updatable = false)
    private int userId;

    @Column(name = "POSTID", nullable = false, insertable = false, updatable = false)
    private int postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", nullable = false)
    private User user;  // 사용자 (FK -> User)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POSTID", nullable = false)
    private ProductPost productPost;  // 게시물 (FK -> ProductPost)

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;
}

